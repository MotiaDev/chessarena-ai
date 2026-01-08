import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { StockfishBenchmarkSummarySchema } from '@chessarena/types/stockfish-benchmark'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetStockfishLeaderboard',
  description: 'Get Stockfish benchmark leaderboard sorted by ACPL',
  path: '/benchmark/stockfish/leaderboard',
  method: 'GET',
  emits: [],
  flows: ['benchmark'],
  responseSchema: {
    200: z.object({
      leaderboard: z.array(StockfishBenchmarkSummarySchema),
    }),
  },
}

export const handler: Handlers['GetStockfishLeaderboard'] = async (req, { logger, streams }) => {
  logger.info('Fetching Stockfish leaderboard')

  const summaries = await streams.stockfishBenchmarkSummary.getGroup('models')

  // Sort by ACPL (lower is better)
  const sorted = summaries.sort((a, b) => (a.averageAcpl ?? Infinity) - (b.averageAcpl ?? Infinity))

  return { status: 200, body: { leaderboard: sorted } }
}
