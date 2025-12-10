import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { GameHistorySchema, GameHistoryFilterSchema } from '@chessarena/types/game-history'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetGameHistory',
  description: 'Get game history with optional filters',
  path: '/chess/history',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  querySchema: GameHistoryFilterSchema,
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

  const {
    provider,
    model,
    variant,
    winner,
    status,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = req.queryParams as z.infer<typeof GameHistoryFilterSchema>

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
