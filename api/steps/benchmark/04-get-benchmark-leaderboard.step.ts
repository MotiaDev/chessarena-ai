import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { LegalMoveBenchmarkSummarySchema } from '@chessarena/types/legal-move-benchmark'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetBenchmarkLeaderboard',
  description: 'Get legal move benchmark leaderboard sorted by average score',
  path: '/benchmark/legal-moves/leaderboard',
  method: 'GET',
  emits: [],
  flows: ['benchmark'],
  responseSchema: {
    200: z.object({
      leaderboard: z.array(LegalMoveBenchmarkSummarySchema),
    }),
  },
}

export const handler: Handlers['GetBenchmarkLeaderboard'] = async (req, { logger, streams }) => {
  logger.info('Fetching benchmark leaderboard')

  const summaries = await streams.legalMoveBenchmarkSummary.getGroup('models')

  // Sort by average score descending
  const sorted = summaries.sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))

  return { status: 200, body: { leaderboard: sorted } }
}
