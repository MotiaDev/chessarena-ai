import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'ExportGameHistory',
  description: 'Export game history in JSON or CSV format',
  path: '/chess/history/export',
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
    { name: 'format', description: 'Export format: json or csv' },
  ],
  responseSchema: {
    200: z.any(),
  },
}

const escapeCsvField = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const handler: Handlers['ExportGameHistory'] = async (req, { logger, streams }) => {
  logger.info('[ExportGameHistory] Exporting game history', { query: req.queryParams })

  const params = req.queryParams as Record<string, string | undefined>
  const provider = params.provider
  const model = params.model
  const variant = params.variant as 'guided' | 'unguided' | undefined
  const winner = params.winner as 'white' | 'black' | undefined
  const status = params.status
  const startDate = params.startDate ? parseInt(params.startDate) : undefined
  const endDate = params.endDate ? parseInt(params.endDate) : undefined
  const format = (params.format as 'json' | 'csv') || 'json'

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
      escapeCsvField(game.id),
      escapeCsvField(new Date(game.startedAt).toISOString()),
      escapeCsvField(new Date(game.endedAt).toISOString()),
      escapeCsvField(game.duration),
      escapeCsvField(game.variant),
      escapeCsvField(game.status),
      escapeCsvField(game.winner),
      escapeCsvField(game.endGameReason),
      escapeCsvField(game.totalMoves),
      escapeCsvField(game.whitePlayer.provider || 'human'),
      escapeCsvField(game.whitePlayer.model),
      escapeCsvField(game.whiteIllegalMoves),
      escapeCsvField(game.blackPlayer.provider || 'human'),
      escapeCsvField(game.blackPlayer.model),
      escapeCsvField(game.blackIllegalMoves),
      escapeCsvField(game.pgn),
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
