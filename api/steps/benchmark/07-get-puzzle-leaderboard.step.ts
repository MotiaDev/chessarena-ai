import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { PuzzleBenchmarkSummarySchema } from '@chessarena/types/puzzle-benchmark'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetPuzzleLeaderboard',
  description: 'Get puzzle benchmark leaderboard',
  path: '/benchmark/puzzles/leaderboard',
  method: 'GET',
  emits: [],
  flows: ['benchmark'],
  responseSchema: {
    200: z.object({
      leaderboard: z.array(PuzzleBenchmarkSummarySchema),
    }),
  },
}

export const handler: Handlers['GetPuzzleLeaderboard'] = async (req, { logger, streams }) => {
  logger.info('Fetching puzzle leaderboard')

  const summaries = await streams.puzzleBenchmarkSummary.getGroup('models')

  // Sort by overall accuracy descending
  const sorted = summaries.sort((a, b) => (b.overallAccuracy ?? 0) - (a.overallAccuracy ?? 0))

  return { status: 200, body: { leaderboard: sorted } }
}
