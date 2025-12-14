import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { GameHistorySchema } from '@chessarena/types/game-history'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetGameHistory',
  description: 'Get game history with optional filters',
  path: '/chess/history',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  queryParams: [
    { name: 'provider', description: 'Filter by AI provider' },
    { name: 'model', description: 'Filter by model name' },
    { name: 'variant', description: 'Filter by game variant' },
    { name: 'winner', description: 'Filter by winner' },
    { name: 'status', description: 'Filter by game status' },
    { name: 'startDate', description: 'Filter by start date (timestamp)' },
    { name: 'endDate', description: 'Filter by end date (timestamp)' },
    { name: 'limit', description: 'Pagination limit' },
    { name: 'offset', description: 'Pagination offset' },
  ],
  responseSchema: {
    200: z.object({
      games: z.array(GameHistorySchema.omit({ moves: true, messages: true })),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  },
}

export const handler: Handlers['GetGameHistory'] = async (req, { logger, streams }) => {
  logger.info('[GetGameHistory] Fetching game history', { query: req.queryParams })

  const params = req.queryParams as Record<string, string | undefined>
  const provider = params.provider
  const model = params.model
  const variant = params.variant as 'guided' | 'unguided' | undefined
  const winner = params.winner as 'white' | 'black' | undefined
  const status = params.status
  const startDate = params.startDate ? parseInt(params.startDate) : undefined
  const endDate = params.endDate ? parseInt(params.endDate) : undefined
  const limit = params.limit ? parseInt(params.limit) : 50
  const offset = params.offset ? parseInt(params.offset) : 0

  const allGames = await streams.chessGameHistory.getGroup('all')

  // Apply filters
  let filtered = allGames.filter((game) => {
    if (provider) {
      const matchesWhite = game.whitePlayer.provider === provider
      const matchesBlack = game.blackPlayer.provider === provider
      if (!matchesWhite && !matchesBlack) return false
    }

    if (model) {
      const matchesWhite = game.whitePlayer.model === model
      const matchesBlack = game.blackPlayer.model === model
      if (!matchesWhite && !matchesBlack) return false
    }

    if (variant && game.variant !== variant) return false
    if (winner && game.winner !== winner) return false
    if (status && game.status !== status) return false
    if (startDate && game.startedAt < startDate) return false
    if (endDate && game.endedAt > endDate) return false

    return true
  })

  // Sort by most recent first
  filtered.sort((a, b) => b.endedAt - a.endedAt)

  const total = filtered.length

  // Apply pagination
  const paginated = filtered.slice(offset, offset + limit)

  // Remove heavy fields for list view
  const games = paginated.map(({ moves, messages, ...rest }) => rest)

  logger.info('[GetGameHistory] Returning games', { total, returned: games.length })

  return {
    status: 200,
    body: { games, total, limit, offset },
  }
}
