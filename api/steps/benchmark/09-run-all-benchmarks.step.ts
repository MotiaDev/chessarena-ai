import { ApiRouteConfig, Handlers, Logger } from 'motia'
import { z } from 'zod'
import { generateTestPositions } from '../../services/benchmark/run-legal-move-benchmark'
import { makeBenchmarkPrompt } from '../../services/benchmark/benchmark-prompt'
import { getAllModels } from '../../services/ai/models'
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

  logger.info('=== STARTING FULL BENCHMARK (SEQUENTIAL) ===', { positionCount, force })

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

  // Get all models to benchmark using the helper function
  const allModels = getAllModels()

  const totalModels = allModels.length
  logger.info('Models to benchmark (sequential)', { totalModels })

  // Run benchmarks in background - ONE AT A TIME
  const runAllBenchmarks = async () => {
    for (let modelIdx = 0; modelIdx < allModels.length; modelIdx++) {
      const { provider, model } = allModels[modelIdx]
      const runId = crypto.randomUUID()
      const key = `${provider}:${model}`

      logger.info(`\n=== MODEL ${modelIdx + 1}/${totalModels}: ${provider}/${model} ===`)

      const results: ModelBenchmarkResult[] = []

      // Process each position sequentially
      for (let posIdx = 0; posIdx < positions.length; posIdx++) {
        const position = positions[posIdx]
        logger.info(`  Position ${posIdx + 1}/${positions.length} (${position.legalMoveCount} legal moves)`)

        const result = await benchmarkSinglePosition(position, provider, model, logger)
        results.push(result)

        if (result.error) {
          logger.error(`    ERROR: ${result.error}`)
        } else {
          logger.info(
            `    Result: ${result.correctMoves.length}/${position.legalMoveCount} correct, ${result.illegalMoves.length} illegal, score=${result.finalScore.toFixed(1)}%`,
          )
        }

        // Small delay between positions to avoid rate limiting
        if (posIdx < positions.length - 1) {
          await new Promise((r) => setTimeout(r, 500))
        }
      }

      // Save completed run
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
      const existing = await streams.legalMoveBenchmarkSummary.get('models', key)
      await streams.legalMoveBenchmarkSummary.set('models', key, {
        id: key,
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

      // Delay between models to avoid rate limiting
      if (modelIdx < allModels.length - 1) {
        logger.info('Waiting 2s before next model...')
        await new Promise((r) => setTimeout(r, 2000))
      }
    }

    logger.info('\n\n========================================')
    logger.info('=== ALL BENCHMARKS COMPLETED ===')
    logger.info('========================================\n')
  }

  // Actually await the benchmarks (fire-and-forget was causing issues)
  await runAllBenchmarks()

  return {
    status: 200,
    body: {
      message: `Benchmark completed for ${totalModels} models`,
      positionCount: positions.length,
      totalModels,
    },
  }
}
