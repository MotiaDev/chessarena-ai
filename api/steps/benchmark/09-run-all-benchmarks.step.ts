import { ApiRouteConfig, Handlers, Logger } from 'motia'
import { z } from 'zod'
import { generateTestPositions, runLegalMoveBenchmark } from '../../services/benchmark/run-legal-move-benchmark'
import { makeBenchmarkPrompt } from '../../services/benchmark/benchmark-prompt'
import { getAllModels } from '../../services/ai/models'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { TestPosition, ModelBenchmarkResult, LegalMoveBenchmarkRun } from '@chessarena/types/legal-move-benchmark'
import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { mapWithConcurrency, parsePositiveInt } from '../../services/benchmark/concurrency'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../chess/legal-move-benchmark.mustache'), 'utf8')

const bodySchema = z.object({
  positionCount: z.number().min(1).max(50).default(20),
  force: z.boolean().default(false),
  rerunCompleted: z.boolean().default(false),
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
  const { positionCount, force, rerunCompleted } = req.body

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

  // Get all models to benchmark using the helper function
  const allModels = getAllModels()

  const existingSummaries = await streams.legalMoveBenchmarkSummary.getGroup('models')
  const completedSet = new Set(existingSummaries.map((s) => `${s.provider}:${s.model}`))

  const modelsToBenchmark = rerunCompleted ? allModels : allModels.filter((m) => !completedSet.has(`${m.provider}:${m.model}`))

  const totalModels = modelsToBenchmark.length
  logger.info('Models to benchmark', { totalModels })

  const runAllBenchmarks = async () => {
    const providerConcurrency = parsePositiveInt(process.env.BENCHMARK_PROVIDER_CONCURRENCY, 4)
    const modelConcurrencyPerProvider = parsePositiveInt(process.env.BENCHMARK_MODEL_CONCURRENCY_PER_PROVIDER, 1)

    const modelsByProvider = modelsToBenchmark.reduce<Record<AiModelProvider, { provider: AiModelProvider; model: string }[]>>(
      (acc, entry) => {
        acc[entry.provider].push(entry)
        return acc
      },
      { openai: [], gemini: [], claude: [], grok: [] },
    )

    const providers: AiModelProvider[] = ['openai', 'gemini', 'claude', 'grok']

    await mapWithConcurrency(providers, providerConcurrency, async (provider) => {
      const models = modelsByProvider[provider]
      await mapWithConcurrency(models, modelConcurrencyPerProvider, async ({ model }) => {
        logger.info(`\n=== MODEL: ${provider}/${model} ===`)

        const run = await runLegalMoveBenchmark(positions, provider, model, logger)

        await streams.legalMoveBenchmark.set('runs', run.id, run)

        const key = `${provider}:${model}`
        if (run.status === 'completed' && run.averageFinalScore !== undefined) {
          const existing = await streams.legalMoveBenchmarkSummary.get('models', key)
          await streams.legalMoveBenchmarkSummary.set('models', key, {
            id: key,
            provider,
            model,
            runsCompleted: (existing?.runsCompleted ?? 0) + 1,
            averageScore: existing
              ? (existing.averageScore * existing.runsCompleted + run.averageFinalScore) / (existing.runsCompleted + 1)
              : run.averageFinalScore,
            bestScore: Math.max(existing?.bestScore ?? 0, run.averageFinalScore),
            worstScore: existing ? Math.min(existing.worstScore, run.averageFinalScore) : run.averageFinalScore,
            lastRunAt: Date.now(),
          })
        } else {
          logger.warn('Skipping summary update for failed run', { provider, model, runId: run.id })
        }
      })
    })

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
