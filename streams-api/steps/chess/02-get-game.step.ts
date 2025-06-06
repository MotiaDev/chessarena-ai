import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { Game, gameSchema } from './streams/00-chess-game.stream'
import { Password } from './types'
import { getGameRole } from '../../services/chess/get-game-role'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetGame',
  description: 'Get a game',
  path: '/chess/game/:id',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  bodySchema: z.object({}),
  queryParams: [{ name: 'password', description: 'The password to get the game' }],
  responseSchema: {
    200: z.object({
      ...gameSchema.shape,
      role: z.enum(['white', 'black', 'spectator', 'root']),
      passwords: z.object({ root: z.string(), white: z.string(), black: z.string() }).optional(),
    }),
    404: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['GetGame'] = async (req, { logger, state, streams }) => {
  logger.info('[GetGame] Received getGame event')

  const gameId = req.pathParams.id
  const game = await streams.chessGame.get('game', gameId)

  if (!game) {
    return { status: 404, body: { message: 'Game not found' } }
  }

  const passwords = (await state.get<Password>(gameId, 'passwords')) ?? undefined
  const role = await getGameRole({
    game: game as Game,
    password: req.queryParams.password as string,
    passwords,
  })

  return {
    status: 200,
    body: {
      ...game,
      role,
      passwords: role === 'root' ? passwords : undefined,
    },
  }
}
