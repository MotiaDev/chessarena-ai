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
  },
}

export const handler: Handlers['SendMessage'] = async (req, { logger, streams }) => {
  logger.info('[SendMessage] Received SendMessage event', { gameId: req.pathParams.id })

  const messageGameId = `${req.pathParams.id}-messages`
  const messageId = crypto.randomUUID()
  const message = await streams.chessGameMessage.set(messageGameId, messageId, {
    message: req.body.message,
    role: req.body.role,
    sender: req.body.name,
    timestamp: Date.now(),
  })

  return { status: 200, body: message }
}
