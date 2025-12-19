import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { AiModelProviderSchema } from '@chessarena/types/ai-models'
import { LegalMoveBenchmarkRunSchema } from '@chessarena/types/legal-move-benchmark'
import { runLegalMoveBenchmark, generateTestPositions } from '../../services/benchmark/run-legal-move-benchmark'
import { getModelsForProvider } from '../../services/ai/models'

const bodySchema = z.object({
  provider: AiModelProviderSchema(),
  model: z.string(),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RunLegalMoveBenchmark',
  description: 'Run legal move generation benchmark for a model',
  path: '/benchmark/legal-moves/run',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: LegalMoveBenchmarkRunSchema,
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['RunLegalMoveBenchmark'] = async (req, { logger, streams }) => {
  const { provider, model } = req.body

  // Validate model exists for provider
  const supportedModels = getModelsForProvider(provider)
  if (!supportedModels.includes(model)) {
    return {
      status: 400,
      body: { message: `Model ${model} is not supported for provider ${provider}` },
    }
  }

  // Get or create position set
  let positionSet = await streams.positionSet.get('sets', 'default')
  if (!positionSet || positionSet.positions.length === 0) {
    logger.info('No position set found, generating new one')
    const positions = generateTestPositions({ count: 20 })
    positionSet = {
      id: `positions-${Date.now()}`,
      createdAt: Date.now(),
      count: positions.length,
      positions,
    }
    await streams.positionSet.set('sets', 'default', positionSet)
  }

  logger.info('Starting legal move benchmark', { provider, model, positionCount: positionSet.positions.length })

  try {
    const run = await runLegalMoveBenchmark(positionSet.positions, provider, model, logger)

    // Store the run result
    await streams.legalMoveBenchmark.set('runs', run.id, run)

    // Update summary for this model
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

    logger.info('Benchmark completed and stored', { runId: run.id })

    return { status: 200, body: run }
  } catch (error) {
    logger.error('Benchmark failed', { error })
    return {
      status: 400,
      body: { message: error instanceof Error ? error.message : 'Benchmark failed' },
    }
  }
}
