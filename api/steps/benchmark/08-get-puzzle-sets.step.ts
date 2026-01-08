import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { PuzzleSetSchema } from '@chessarena/types/puzzle-benchmark'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetPuzzleSets',
  description: 'Get all cached puzzle sets',
  path: '/benchmark/puzzles/sets',
  method: 'GET',
  emits: [],
  flows: ['benchmark'],
  responseSchema: {
    200: z.object({
      sets: z.array(
        PuzzleSetSchema.omit({ puzzles: true }).extend({
          puzzleCount: z.number(),
        }),
      ),
    }),
  },
}

export const handler: Handlers['GetPuzzleSets'] = async (req, { logger, streams }) => {
  logger.info('Fetching puzzle sets')

  const allSets = await streams.puzzleSet.getGroup('sets')

  const sets = allSets.map(({ puzzles, ...rest }) => ({
    ...rest,
    puzzleCount: puzzles?.length ?? 0,
  }))

  return { status: 200, body: { sets } }
}
