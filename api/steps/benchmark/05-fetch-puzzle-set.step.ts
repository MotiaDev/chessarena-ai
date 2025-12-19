import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { PuzzleSetSchema, PuzzleThemeSchema } from '@chessarena/types/puzzle-benchmark'
import { fetchPuzzles } from '../../services/benchmark/fetch-lichess-puzzles'

const bodySchema = z.object({
  theme: PuzzleThemeSchema,
  count: z.number().min(1).max(100).default(50),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'FetchPuzzleSet',
  description: 'Fetch and store a set of puzzles from Lichess',
  path: '/benchmark/puzzles/fetch',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: PuzzleSetSchema,
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['FetchPuzzleSet'] = async (req, { logger, streams }) => {
  const { theme, count } = req.body

  logger.info('Fetching puzzle set', { theme, count })

  // Check if we already have a puzzle set for this theme
  const existingSet = await streams.puzzleSet.get('sets', theme)
  if (existingSet && existingSet.puzzles.length >= count) {
    logger.info('Using existing puzzle set', { theme, existingCount: existingSet.puzzles.length })
    return { status: 200, body: existingSet }
  }

  try {
    const existingIds = new Set<string>(existingSet?.puzzles.map((p) => p.id) ?? [])
    const needed = existingSet ? Math.max(0, count - existingSet.puzzles.length) : count

    const fetched = needed > 0 ? await fetchPuzzles(theme, needed, logger) : []
    const newUnique = fetched.filter((p) => !existingIds.has(p.id))

    const puzzles = existingSet ? [...existingSet.puzzles, ...newUnique] : newUnique

    if (puzzles.length === 0) {
      return { status: 400, body: { message: 'Failed to fetch any puzzles' } }
    }

    const puzzleSet = {
      id: `${theme}-${Date.now()}`,
      theme,
      createdAt: Date.now(),
      puzzles,
      count: puzzles.length,
    }

    // Store the puzzle set
    await streams.puzzleSet.set('sets', theme, puzzleSet)

    logger.info('Puzzle set created', { theme, count: puzzles.length })

    return { status: 200, body: puzzleSet }
  } catch (error) {
    logger.error('Failed to fetch puzzles', { error })
    return {
      status: 400,
      body: { message: error instanceof Error ? error.message : 'Failed to fetch puzzles' },
    }
  }
}
