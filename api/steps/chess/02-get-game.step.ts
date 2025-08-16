import { GameSchema } from '@chessarena/types/game'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { getGameRole } from '../../services/chess/get-game-role'
import { randomUserName } from '../../services/chess/random-user-name'
import { UserState } from '../states/user-state'
import { auth } from '../middlewares/auth.middleware'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetGame',
  description: 'Get a game',
  path: '/chess/game/:id',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  middleware: [auth({ required: false })],
  bodySchema: z.object({}),
  queryParams: [{ name: 'password', description: 'The password to get the game' }],
  responseSchema: {
    200: z.object({
      ...GameSchema.shape,
      role: z.enum(['white', 'black', 'spectator', 'root']),
      username: z.string(),
      passwords: z.object({ root: z.string(), white: z.string(), black: z.string() }).optional(),
    }),
    404: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['GetGame'] = async (req, { logger, state, streams }) => {
  logger.info('Received getGame event')

  const gameId = req.pathParams.id
  const game = await streams.chessGame.get('game', gameId)

  if (!game) {
    return { status: 404, body: { message: 'Game not found' } }
  }

  const userState = new UserState(state)
  const userId = req.tokenInfo?.sub
  const user = userId ? await userState.getUser(userId) : undefined
  const role = getGameRole(game, userId)
  const username = user?.name ?? randomUserName()

  logger.info('User found', { userId, role, username })

  return {
    status: 200,
    body: {
      ...game,
      role,
      username,
    },
  }
}
