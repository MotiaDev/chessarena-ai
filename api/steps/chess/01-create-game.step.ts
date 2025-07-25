import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { gameSchema } from './streams/00-chess-game.stream'
import { createPasswords } from '../../services/chess/create-passwords'
import { createGame } from '../../services/chess/create-game'

const bodySchema = z.object({
  players: z.object({
    white: z.object({
      name: z.string({ description: 'The name of the player' }),
    }),
    black: z.object({
      name: z.string({ description: 'The name of the player' }),
      ai: z.enum(['openai', 'gemini', 'claude']).optional(),
    }),
  }),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'CreateGame',
  description: 'Create a new game',
  path: '/chess/create-game',
  method: 'POST',
  emits: ['chess-game-created'],
  flows: ['chess'],
  bodySchema,
  responseSchema: {
    200: gameSchema,
    400: z.object({ message: z.string(), errors: z.array(z.object({ message: z.string() })) }),
  },
}

export const handler: Handlers['CreateGame'] = async (req, { logger, emit, state, streams }) => {
  logger.info('[CreateGame] Received createGame event')

  const validationResult = bodySchema.safeParse(req.body)

  if (!validationResult.success) {
    logger.error('[CreateGame] Invalid request body', { errors: validationResult.error.errors })
    return { status: 400, body: { message: 'Invalid request body', errors: validationResult.error.errors } }
  }

  const game = await createGame(req.body.players, streams, logger)
  const passwords = await createPasswords(state, game.id)

  logger.info('[CreateGame] Game created', { gameId: game.id })

  await emit({
    topic: 'chess-game-created',
    data: { gameId: game.id, fenBefore: game.fen },
  })

  return {
    status: 200,
    body: { ...game, passwords },
  }
}
