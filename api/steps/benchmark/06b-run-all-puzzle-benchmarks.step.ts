import { ApiRouteConfig, Handlers, Logger } from 'motia'
import { z } from 'zod'
import { PuzzleThemeSchema } from '@chessarena/types/puzzle-benchmark'
import { getAllModels } from '../../services/ai/models'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { runPuzzleBenchmark } from '../../services/benchmark/run-puzzle-benchmark'
import { fetchPuzzles } from '../../services/benchmark/fetch-lichess-puzzles'
import { mapWithConcurrency, parsePositiveInt } from '../../services/benchmark/concurrency'

const bodySchema = z.object({
  theme: PuzzleThemeSchema,
  count: z.number().min(1).max(100).default(10),
  rerunCompleted: z.boolean().default(false),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RunAllPuzzleBenchmarks',
  description: 'Fetch a puzzle set (if needed) and run puzzle benchmark for all models',
  path: '/benchmark/puzzles/run-all',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: z.object({
      message: z.string(),
      theme: PuzzleThemeSchema,
      puzzleCount: z.number(),
      totalModels: z.number(),
    }),
    400: z.object({ message: z.string() }),
  },
}

const shouldSkipModel = (theme: z.infer<typeof PuzzleThemeSchema>, existing: any | undefined): boolean => {
  if (!existing) return false
  if (theme === 'mateIn1') return typeof existing.mateIn1Accuracy === 'number'
  if (theme === 'oneMove') return typeof existing.oneMoveAccuracy === 'number'
  return false
}

export const handler: Handlers['RunAllPuzzleBenchmarks'] = async (req, { logger, streams }) => {
  const theme = req.body.theme
  const count = req.body.count ?? 10
  const rerunCompleted = req.body.rerunCompleted

  let puzzleSet = await streams.puzzleSet.get('sets', theme)
  if (!puzzleSet || puzzleSet.puzzles.length < count) {
    const needed = puzzleSet ? Math.max(0, count - puzzleSet.puzzles.length) : count
    const fetched = needed > 0 ? await fetchPuzzles(theme, needed, logger as Logger) : []
    const existingIds = new Set<string>(puzzleSet?.puzzles.map((p) => p.id) ?? [])
    const newUnique = fetched.filter((p) => !existingIds.has(p.id))
    const puzzles = puzzleSet ? [...puzzleSet.puzzles, ...newUnique] : newUnique

    if (puzzles.length === 0) {
      return { status: 400, body: { message: 'Failed to fetch any puzzles' } }
    }

    puzzleSet = {
      id: `${theme}-${Date.now()}`,
      theme,
      createdAt: Date.now(),
      puzzles,
      count: puzzles.length,
    }
    await streams.puzzleSet.set('sets', theme, puzzleSet)
  }

  const uniqueById = new Map<string, (typeof puzzleSet.puzzles)[number]>()
  for (const p of puzzleSet.puzzles) uniqueById.set(p.id, p)
  const puzzlesToRun = Array.from(uniqueById.values()).slice(0, count)

  logger.info('RunAllPuzzleBenchmarks starting', {
    theme,
    requestedCount: count,
    availableInSet: puzzleSet.puzzles.length,
    uniqueAvailable: uniqueById.size,
    using: puzzlesToRun.length,
    rerunCompleted,
  })

  const allModels = getAllModels()
  const existingSummaries = await streams.puzzleBenchmarkSummary.getGroup('models')
  const existingMap = new Map(existingSummaries.map((s) => [`${s.provider}:${s.model}`, s]))

  const modelsToBenchmark = rerunCompleted
    ? allModels
    : allModels.filter(({ provider, model }) => !shouldSkipModel(theme, existingMap.get(`${provider}:${model}`)))

  const providerConcurrency = parsePositiveInt(process.env.BENCHMARK_PROVIDER_CONCURRENCY, 4)
  const modelConcurrencyPerProvider = parsePositiveInt(process.env.BENCHMARK_MODEL_CONCURRENCY_PER_PROVIDER, 1)

  const modelsByProvider = modelsToBenchmark.reduce<
    Record<AiModelProvider, { provider: AiModelProvider; model: string }[]>
  >(
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
      logger.info(`\n=== PUZZLES MODEL: ${provider}/${model} (${theme}) ===`)

      const run = await runPuzzleBenchmark(puzzlesToRun, puzzleSet!.id, theme, provider, model, logger)
      await streams.puzzleBenchmark.set('runs', run.id, run)

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
        overallAccuracy: 0,
      }

      if (newSummary.mateIn1Accuracy !== undefined && newSummary.oneMoveAccuracy !== undefined) {
        newSummary.overallAccuracy = (newSummary.mateIn1Accuracy + newSummary.oneMoveAccuracy) / 2
      } else {
        newSummary.overallAccuracy = newSummary.mateIn1Accuracy ?? newSummary.oneMoveAccuracy ?? 0
      }

      await streams.puzzleBenchmarkSummary.set('models', summaryId, newSummary)
    })
  })

  return {
    status: 200,
    body: {
      message: `Puzzle benchmark completed for ${modelsToBenchmark.length} models`,
      theme,
      puzzleCount: count,
      totalModels: modelsToBenchmark.length,
    },
  }
}
