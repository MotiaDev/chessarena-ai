import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { GameHistoryFilterSchema } from '@chessarena/types/game-history'

const ExportQuerySchema = GameHistoryFilterSchema.extend({
  format: z.enum(['json', 'csv']).default('json'),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'ExportGameHistory',
  description: 'Export game history in JSON or CSV format',
  path: '/chess/history/export',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  querySchema: ExportQuerySchema,
  responseSchema: {
    200: z.any(),
  },
}

export const handler: Handlers['ExportGameHistory'] = async (req, { logger, streams }) => {
  logger.info('[ExportGameHistory] Exporting game history', { query: req.queryParams })

  const {
    provider,
    model,
    variant,
    winner,
    status,
    startDate,
    endDate,
    format = 'json',
  } = req.queryParams as z.infer<typeof ExportQuerySchema>

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

  if (format === 'csv') {
    const headers = [
      'id',
      'startedAt',
      'endedAt',
      'duration',
      'variant',
      'status',
      'winner',
      'endGameReason',
      'totalMoves',
      'whiteProvider',
      'whiteModel',
      'whiteIllegalMoves',
      'blackProvider',
      'blackModel',
      'blackIllegalMoves',
      'pgn',
    ]

    const rows = filtered.map((game) => [
      game.id,
      new Date(game.startedAt).toISOString(),
      new Date(game.endedAt).toISOString(),
      game.duration,
      game.variant,
      game.status,
      game.winner || '',
      game.endGameReason || '',
      game.totalMoves,
      game.whitePlayer.provider || 'human',
      game.whitePlayer.model || '',
      game.whiteIllegalMoves,
      game.blackPlayer.provider || 'human',
      game.blackPlayer.model || '',
      game.blackIllegalMoves,
      `"${(game.pgn || '').replace(/"/g, '""')}"`,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="chessarena-history.csv"',
      },
      body: csv,
    }
  }

  // JSON format - include everything except full moves/messages for smaller payload
  const exportData = filtered.map(({ moves, messages, ...rest }) => ({
    ...rest,
    movesCount: moves.length,
    messagesCount: messages.length,
  }))

  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="chessarena-history.json"',
    },
    body: exportData,
  }
}
