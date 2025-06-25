import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'SendMessage',
  description: 'Send a message to the game',
  emits: [],
  flows: ['chess'],
  method: 'POST',
  path: '/chess/game/:id/send-message',

  bodySchema: z.object({
    message: z.string({ description: 'The message to send' }),
    name: z.string({ description: 'The name of the player sending the message' }),
    role: z.enum(['white', 'black', 'spectator', 'root'], { description: 'The role of the sender' }),
  }),

  responseSchema: {
    200: z.object({
      message: z.string({ description: 'The message' }),
      sender: z.string({ description: 'The name of the sender' }),
      timestamp: z.number({ description: 'The timestamp of the message' }),
    }),
    404: z.object({ message: z.string({ description: 'The message' }) }),
  },
}

export const handler: Handlers['SendMessage'] = async (req, { logger, streams }) => {
  logger.info('[SendMessage] Received SendMessage event', { gameId: req.pathParams.id })

  const messageId = crypto.randomUUID()
  const game = await streams.chessGame.get('game', req.pathParams.id)

  if (!game) {
    return { status: 404, body: { message: 'Game not found' } }
  }

  const message = {
    id: messageId,
    message: req.body.message,
    role: req.body.role,
    sender: req.body.name,
    timestamp: Date.now(),
  }

  const isSpectator = req.body.role === 'spectator'
  const isAiGame = !!game.players.black.ai && !!game.players.white.ai
  const result =
    isAiGame || isSpectator
      ? await streams.chessSidechatMessage.set(game.id, messageId, message)
      : await streams.chessGameMessage.set(game.id, messageId, message)

  return { status: 200, body: result }
}
