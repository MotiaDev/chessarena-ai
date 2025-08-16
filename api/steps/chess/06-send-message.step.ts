import { roleSchema } from '@chessarena/types/game'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { getGameRole } from '../../services/chess/get-game-role'
import { auth } from '../middlewares/auth.middleware'
import { UserState } from '../states/user-state'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'SendMessage',
  description: 'Send a message to the game',
  emits: [],
  flows: ['chess'],
  method: 'POST',
  path: '/chess/game/:id/send-message',

  middleware: [auth({ required: false })],

  bodySchema: z.object({
    message: z.string({ description: 'The message to send' }),
    name: z.string({ description: 'The name of the player sending the message' }),
    role: roleSchema,
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

export const handler: Handlers['SendMessage'] = async (req, { logger, streams, state }) => {
  logger.info('Received SendMessage event', { gameId: req.pathParams.id })

  const userState = new UserState(state)
  const messageId = crypto.randomUUID()
  const game = await streams.chessGame.get('game', req.pathParams.id)

  if (!game) {
    return { status: 404, body: { message: 'Game not found' } }
  }

  const userId = req.tokenInfo?.sub
  const role = getGameRole(game, userId)
  const user = userId ? await userState.getUser(userId) : undefined

  const message = {
    id: messageId,
    message: req.body.message,
    timestamp: Date.now(),
    sender: user?.name ?? req.body.name,
    role,
    profilePic: user?.profilePic,
  }

  const isAiGame = !!game.players.black.ai && !!game.players.white.ai
  const result =
    isAiGame || role === 'spectator'
      ? await streams.chessSidechatMessage.set(game.id, messageId, message)
      : await streams.chessGameMessage.set(game.id, messageId, message)

  return { status: 200, body: result }
}
