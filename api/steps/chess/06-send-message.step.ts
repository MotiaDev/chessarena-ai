import { roleSchema } from '@chessarena/types/game'
import { api, type Handlers, type StepConfig } from 'motia'
import { z } from 'zod'
import { getGameRole } from '../../services/chess/get-game-role'
import { auth } from '../middlewares/auth.middleware'
import { UserState } from '../states/user-state'

export const config = {
  name: 'SendMessage',
  description: 'Send a message to the game',
  flows: ['chess'],
  triggers: [
    api('POST', '/chess/game/:id/send-message', {
      bodySchema: z
        .object({
          message: z.string().describe('The message to send'),
          name: z.string().describe('The name of the player sending the message'),
          role: roleSchema,
        })
        .strict(),
      responseSchema: {
        200: z.object({
          message: z.string().describe('The message'),
          sender: z.string().describe('The name of the sender'),
          timestamp: z.number().describe('The timestamp of the message'),
        }),
        404: z.object({ message: z.string().describe('The message') }).strict(),
      },
      middleware: [auth({ required: false })],
    }),
  ],
  enqueues: [],
  virtualEnqueues: [],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (req, { logger, streams, state }) => {
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
  const { new_value: result } =
    isAiGame || role === 'spectator'
      ? await streams.chessSidechatMessage.set(game.id, messageId, message)
      : await streams.chessGameMessage.set(game.id, messageId, message)

  return { status: 200, body: result }
}
