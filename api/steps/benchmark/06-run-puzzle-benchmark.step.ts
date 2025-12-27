import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { AiModelProviderSchema } from '@chessarena/types/ai-models'
import { PuzzleBenchmarkRunSchema, PuzzleThemeSchema } from '@chessarena/types/puzzle-benchmark'
import { runPuzzleBenchmark } from '../../services/benchmark/run-puzzle-benchmark'
import { getModelsForProvider } from '../../services/ai/models'

const bodySchema = z.object({
  provider: AiModelProviderSchema(),
  model: z.string(),
  theme: PuzzleThemeSchema,
  count: z.number().min(1).max(100).default(10),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RunPuzzleBenchmark',
  description: 'Run puzzle benchmark for a model',
  path: '/benchmark/puzzles/run',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: PuzzleBenchmarkRunSchema,
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['RunPuzzleBenchmark'] = async (req, { logger, streams }) => {
  const { provider, model, theme, count } = req.body

  // Validate model exists
  const supportedModels = getModelsForProvider(provider)
  if (!supportedModels.includes(model)) {
    return {
      status: 400,
      body: { message: `Model ${model} is not supported for provider ${provider}` },
    }
  }

  // Get the puzzle set
  const puzzleSet = await streams.puzzleSet.get('sets', theme)
  if (!puzzleSet || puzzleSet.puzzles.length === 0) {
    return {
      status: 400,
      body: { message: `No puzzle set found for theme ${theme}. Fetch puzzles first.` },
    }
  }

  const puzzles = puzzleSet.puzzles.slice(0, count)
  logger.info('Starting puzzle benchmark', { provider, model, theme, puzzleCount: puzzles.length })

  try {
    const run = await runPuzzleBenchmark(puzzles, puzzleSet.id, theme, provider, model, logger)

    // Store the run
    await streams.puzzleBenchmark.set('runs', run.id, run)

    // Update summary
    const summaryId = `${provider}:${model}`
    const existingSummary = await streams.puzzleBenchmarkSummary.get('models', summaryId)

    const newSummary = {
      id: summaryId,
      provider,
      model,
      runsCompleted: (existingSummary?.runsCompleted ?? 0) + 1,
      lastRunAt: Date.now(),
      mateIn1Accuracy: theme === 'mateIn1' ? run.accuracy : existingSummary?.mateIn1Accuracy,
      oneMoveAccuracy: theme === 'oneMove' ? run.accuracy : existingSummary?.oneMoveAccuracy,
      overallAccuracy: 0, // Will be calculated below
    }

    // Calculate overall accuracy if both themes have been run
    if (newSummary.mateIn1Accuracy !== undefined && newSummary.oneMoveAccuracy !== undefined) {
      newSummary.overallAccuracy = (newSummary.mateIn1Accuracy + newSummary.oneMoveAccuracy) / 2
    } else {
      newSummary.overallAccuracy = newSummary.mateIn1Accuracy ?? newSummary.oneMoveAccuracy ?? 0
    }

    await streams.puzzleBenchmarkSummary.set('models', summaryId, newSummary)

    return { status: 200, body: run }
  } catch (error) {
    logger.error('Puzzle benchmark failed', { error })
    return {
      status: 400,
      body: { message: error instanceof Error ? error.message : 'Benchmark failed' },
    }
  }
}
