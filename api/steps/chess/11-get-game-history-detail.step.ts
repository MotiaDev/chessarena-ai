import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { GameHistorySchema } from '@chessarena/types/game-history'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetGameHistoryDetail',
  description: 'Get detailed game history including all moves and messages',
  path: '/chess/history/:gameId',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  responseSchema: {
    200: GameHistorySchema,
    404: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['GetGameHistoryDetail'] = async (req, { logger, streams }) => {
  const { gameId } = req.pathParams
  logger.info('[GetGameHistoryDetail] Fetching game', { gameId })

  const game = await streams.chessGameHistory.get('all', gameId)

  if (!game) {
    logger.warn('[GetGameHistoryDetail] Game not found', { gameId })
    return {
      status: 404,
      body: { message: 'Game not found in history' },
    }
  }

  return {
    status: 200,
    body: game,
  }
}
