import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { runLegalMoveBenchmark, generateTestPositions } from '../../services/benchmark/run-legal-move-benchmark'
import { supportedModelsByProvider } from '../../services/ai/models'
import { AiModelProvider } from '@chessarena/types/ai-models'

const bodySchema = z.object({
  positionCount: z.number().min(1).max(50).default(20),
  force: z.boolean().default(false), // Force regenerate positions
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RunAllBenchmarks',
  description: 'Run legal move benchmark for ALL models in parallel',
  path: '/benchmark/legal-moves/run-all',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: z.object({
      message: z.string(),
      positionCount: z.number(),
      modelsQueued: z.number(),
      models: z.array(z.object({
        provider: z.string(),
        model: z.string(),
      })),
    }),
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['RunAllBenchmarks'] = async (req, { logger, streams }) => {
  const { positionCount, force } = req.body

  logger.info('Starting benchmark for all models', { positionCount, force })

  // Get or create position set
  let positionSet = await streams.positionSet.get('sets', 'default')
  if (!positionSet || positionSet.positions.length === 0 || force) {
    logger.info('Generating new position set', { count: positionCount })
    const positions = generateTestPositions({ count: positionCount })
    positionSet = {
      id: `positions-${Date.now()}`,
      createdAt: Date.now(),
      count: positions.length,
      positions,
    }
    await streams.positionSet.set('sets', 'default', positionSet)
  }

  // Get all models
  const allModels: { provider: AiModelProvider; model: string }[] = []
  for (const [provider, models] of Object.entries(supportedModelsByProvider)) {
    for (const model of models) {
      allModels.push({ provider: provider as AiModelProvider, model })
    }
  }

  logger.info('Running benchmarks in parallel', { modelCount: allModels.length })

  // Run all benchmarks in parallel (fire and forget)
  const runBenchmark = async (provider: AiModelProvider, model: string) => {
    try {
      logger.info('Starting benchmark', { provider, model })
      const run = await runLegalMoveBenchmark(positionSet!.positions, provider, model, logger)

      // Store the run result
      await streams.legalMoveBenchmark.set('runs', run.id, run)

      // Update summary
      const summaryId = `${provider}:${model}`
      const existingSummary = await streams.legalMoveBenchmarkSummary.get('models', summaryId)

      const newSummary = {
        id: summaryId,
        provider,
        model,
        runsCompleted: (existingSummary?.runsCompleted ?? 0) + 1,
        averageScore: existingSummary
          ? (existingSummary.averageScore * existingSummary.runsCompleted + (run.averageFinalScore ?? 0)) /
            (existingSummary.runsCompleted + 1)
          : (run.averageFinalScore ?? 0),
        bestScore: Math.max(existingSummary?.bestScore ?? 0, run.averageFinalScore ?? 0),
        worstScore: existingSummary
          ? Math.min(existingSummary.worstScore, run.averageFinalScore ?? 0)
          : (run.averageFinalScore ?? 0),
        lastRunAt: Date.now(),
      }

      await streams.legalMoveBenchmarkSummary.set('models', summaryId, newSummary)

      logger.info('Benchmark completed', { provider, model, score: run.averageFinalScore })
    } catch (error) {
      logger.error('Benchmark failed', { provider, model, error })
    }
  }

  // Fire all benchmarks in parallel (don't await)
  Promise.all(allModels.map(({ provider, model }) => runBenchmark(provider, model)))

  return {
    status: 200,
    body: {
      message: 'Benchmarks started for all models in parallel',
      positionCount: positionSet.positions.length,
      modelsQueued: allModels.length,
      models: allModels,
    },
  }
}
