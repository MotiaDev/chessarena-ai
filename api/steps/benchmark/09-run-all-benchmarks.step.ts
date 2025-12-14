import { ApiRouteConfig, Handlers, Logger } from 'motia'
import { z } from 'zod'
import { generateTestPositions } from '../../services/benchmark/run-legal-move-benchmark'
import { makeBenchmarkPrompt } from '../../services/benchmark/benchmark-prompt'
import { supportedModelsByProvider } from '../../services/ai/models'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { TestPosition, ModelBenchmarkResult, LegalMoveBenchmarkRun } from '@chessarena/types/legal-move-benchmark'
import fs from 'fs'
import path from 'path'
import mustache from 'mustache'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../chess/legal-move-benchmark.mustache'), 'utf8')

const bodySchema = z.object({
  positionCount: z.number().min(1).max(50).default(20),
  force: z.boolean().default(false),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RunAllBenchmarks',
  description: 'Run legal move benchmark for ALL models - one per provider in parallel',
  path: '/benchmark/legal-moves/run-all',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: z.object({
      message: z.string(),
      positionCount: z.number(),
      totalModels: z.number(),
    }),
    400: z.object({ message: z.string() }),
  },
}

// Calculate F1 score
const calculateScore = (legalMoves: string[], modelMoves: string[]) => {
  const legalSet = new Set(legalMoves)
  const correct = modelMoves.filter((m) => legalSet.has(m))
  const illegal = modelMoves.filter((m) => !legalSet.has(m))
  const missed = legalMoves.filter((m) => !new Set(modelMoves).has(m))

  const recall = legalMoves.length > 0 ? (correct.length / legalMoves.length) * 100 : 0
  const precision = modelMoves.length > 0 ? (correct.length / modelMoves.length) * 100 : 0
  const finalScore = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  return { correct, illegal, missed, accuracy: recall, penalty: 100 - precision, finalScore }
}

// Benchmark single position for single model
const benchmarkSinglePosition = async (
  position: TestPosition,
  provider: AiModelProvider,
  model: string,
  logger: Logger,
): Promise<ModelBenchmarkResult> => {
  const prompt = mustache.render(
    promptTemplate,
    { pgn: position.pgn, fen: position.fen, turn: position.turn.toUpperCase() },
    {},
    { escape: (v: string) => v },
  )

  const startTime = Date.now()
  let rawResponse = ''
  let modelMoves: string[] = []
  let error: string | undefined

  try {
    const response = await makeBenchmarkPrompt({ prompt, provider, model, logger })
    rawResponse = response.rawResponse
    modelMoves = response.moves
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  const responseTime = Date.now() - startTime
  const { correct, illegal, missed, accuracy, penalty, finalScore } = calculateScore(position.legalMoves, modelMoves)

  return {
    positionId: position.id,
    modelMoves,
    correctMoves: correct,
    illegalMoves: illegal,
    missedMoves: missed,
    accuracy,
    penalty,
    finalScore,
    responseTime,
    rawResponse,
    error,
  }
}

export const handler: Handlers['RunAllBenchmarks'] = async (req, { logger, streams }) => {
  const { positionCount, force } = req.body

  logger.info('=== STARTING FULL BENCHMARK ===', { positionCount, force })

  // Get or create positions
  let positionSet = await streams.positionSet.get('sets', 'default')
  if (!positionSet || positionSet.positions.length === 0 || force) {
    logger.info('Generating positions...', { count: positionCount })
    const positions = generateTestPositions({ count: positionCount })
    positionSet = {
      id: `positions-${Date.now()}`,
      createdAt: Date.now(),
      count: positions.length,
      positions,
    }
    await streams.positionSet.set('sets', 'default', positionSet)
    logger.info('Positions generated', { count: positions.length })
  }

  const positions = positionSet.positions

  // Group models by provider (one from each provider runs in parallel)
  const modelsByProvider: Record<string, { provider: AiModelProvider; model: string }[]> = {}
  for (const [provider, models] of Object.entries(supportedModelsByProvider)) {
    modelsByProvider[provider] = models.map((model) => ({ provider: provider as AiModelProvider, model }))
  }

  const providers = Object.keys(modelsByProvider) as AiModelProvider[]
  const maxModelsPerProvider = Math.max(...Object.values(modelsByProvider).map((m) => m.length))
  const totalModels = Object.values(modelsByProvider).flat().length

  logger.info('Models to benchmark', { totalModels, providers, maxModelsPerProvider })

  // Initialize results storage for each model
  const modelResults: Record<string, { results: ModelBenchmarkResult[]; runId: string }> = {}

  // Run benchmarks in background
  const runAllBenchmarks = async () => {
    // For each model index (round-robin across providers)
    for (let modelIdx = 0; modelIdx < maxModelsPerProvider; modelIdx++) {
      // Get one model from each provider for this round
      const currentBatch: { provider: AiModelProvider; model: string }[] = []
      for (const provider of providers) {
        if (modelsByProvider[provider][modelIdx]) {
          currentBatch.push(modelsByProvider[provider][modelIdx])
        }
      }

      if (currentBatch.length === 0) continue

      logger.info(`\n=== ROUND ${modelIdx + 1}/${maxModelsPerProvider} ===`)
      logger.info('Models in this round', { models: currentBatch.map((m) => `${m.provider}/${m.model}`) })

      // Initialize results for new models
      for (const { provider, model } of currentBatch) {
        const key = `${provider}:${model}`
        if (!modelResults[key]) {
          modelResults[key] = { results: [], runId: crypto.randomUUID() }
        }
      }

      // Process each position
      for (let posIdx = 0; posIdx < positions.length; posIdx++) {
        const position = positions[posIdx]
        logger.info(`\n--- Position ${posIdx + 1}/${positions.length} (${position.legalMoveCount} legal moves) ---`)

        // Run all models in current batch on this position in parallel
        const results = await Promise.all(
          currentBatch.map(async ({ provider, model }) => {
            const result = await benchmarkSinglePosition(position, provider, model, logger)
            logger.info(
              `  ${provider}/${model}: ${result.correctMoves.length}/${position.legalMoveCount} correct, ${result.illegalMoves.length} illegal, score=${result.finalScore.toFixed(1)}%`,
            )
            return { provider, model, result }
          }),
        )

        // Store results
        for (const { provider, model, result } of results) {
          modelResults[`${provider}:${model}`].results.push(result)
        }

        // Small delay between positions
        if (posIdx < positions.length - 1) {
          await new Promise((r) => setTimeout(r, 1000))
        }
      }

      // Save completed runs for this batch
      for (const { provider, model } of currentBatch) {
        const key = `${provider}:${model}`
        const { results, runId } = modelResults[key]

        const completedResults = results.filter((r) => !r.error)
        const run: LegalMoveBenchmarkRun = {
          id: runId,
          createdAt: Date.now(),
          completedAt: Date.now(),
          status: 'completed',
          provider,
          model,
          positionCount: positions.length,
          positions,
          results,
          averageAccuracy:
            completedResults.length > 0
              ? completedResults.reduce((s, r) => s + r.accuracy, 0) / completedResults.length
              : 0,
          averagePenalty:
            completedResults.length > 0
              ? completedResults.reduce((s, r) => s + r.penalty, 0) / completedResults.length
              : 0,
          averageFinalScore:
            completedResults.length > 0
              ? completedResults.reduce((s, r) => s + r.finalScore, 0) / completedResults.length
              : 0,
          totalCorrectMoves: completedResults.reduce((s, r) => s + r.correctMoves.length, 0),
          totalIllegalMoves: completedResults.reduce((s, r) => s + r.illegalMoves.length, 0),
          totalMissedMoves: completedResults.reduce((s, r) => s + r.missedMoves.length, 0),
        }

        await streams.legalMoveBenchmark.set('runs', runId, run)

        // Update summary
        const summaryId = key
        const existing = await streams.legalMoveBenchmarkSummary.get('models', summaryId)
        await streams.legalMoveBenchmarkSummary.set('models', summaryId, {
          id: summaryId,
          provider,
          model,
          runsCompleted: (existing?.runsCompleted ?? 0) + 1,
          averageScore: run.averageFinalScore ?? 0,
          bestScore: Math.max(existing?.bestScore ?? 0, run.averageFinalScore ?? 0),
          worstScore: existing
            ? Math.min(existing.worstScore, run.averageFinalScore ?? 0)
            : (run.averageFinalScore ?? 0),
          lastRunAt: Date.now(),
        })

        logger.info(`\n✓ ${provider}/${model} COMPLETED: Score=${run.averageFinalScore?.toFixed(1)}%`)
      }

      // Delay between rounds
      if (modelIdx < maxModelsPerProvider - 1) {
        logger.info('\nWaiting 3s before next round...')
        await new Promise((r) => setTimeout(r, 3000))
      }
    }

    logger.info('\n\n========================================')
    logger.info('=== ALL BENCHMARKS COMPLETED ===')
    logger.info('========================================\n')
  }

  // Fire and forget
  runAllBenchmarks()

  return {
    status: 200,
    body: {
      message: `Benchmark started for ${totalModels} models across ${providers.length} providers`,
      positionCount: positions.length,
      totalModels,
    },
  }
}
