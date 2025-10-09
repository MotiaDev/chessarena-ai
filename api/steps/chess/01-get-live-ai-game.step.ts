import { AiModelProvider, AiModelProviderSchema } from '@chessarena/types/ai-models'
import { Game, GameSchema } from '@chessarena/types/game'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { createGame } from '../../services/chess/create-game'
import { models } from '../../services/ai/models'

const bodySchema = z.object({ players: z.array(AiModelProviderSchema()).length(2) })

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetLiveAiGame',
  description: 'Get a live AI game',
  path: '/chess/get-live-ai-game',
  method: 'POST',
  emits: [{ topic: 'chess-game-created', label: 'When a new game is created' }],
  flows: ['chess'],
  bodySchema,
  responseSchema: {
    200: GameSchema,
    400: z.object({ message: z.string(), errors: z.array(z.object({ message: z.string() })).optional() }),
    404: z.object({ message: z.string() }),
  },
}

const isOlderThan10Minutes = (createdAt?: string) => {
  if (!createdAt) return true

  const tenMinutesInMilliseconds = 10 * 60 * 1000
  const createdAtDate = new Date(createdAt)

  return Date.now() - createdAtDate.getTime() > tenMinutesInMilliseconds
}

export const handler: Handlers['GetLiveAiGame'] = async (req, { logger, emit, state, streams }) => {
  logger.info('Received createGame event')

  const validationResult = bodySchema.safeParse(req.body)

  if (!validationResult.success) {
    logger.error('Invalid request body', { errors: validationResult.error.errors })
    return { status: 400, body: { message: 'Invalid request body', errors: validationResult.error.errors } }
  }

  const white = req.body.players[0] as AiModelProvider
  const black = req.body.players[1] as AiModelProvider

  if (white === black) {
    logger.error('AI agents cannot play against themselves')
    return { status: 404, body: { message: 'AI agents cannot play against themselves' } }
  }

  const id = `${white}-vs-${black}`
  const liveAiGame = await streams.chessLiveAiGames.get('game', id)

  if (liveAiGame && !isOlderThan10Minutes(liveAiGame.createdAt)) {
    const game = await streams.chessGame.get('game', liveAiGame.gameId)

    if (game && game.status === 'pending') {
      logger.info('Returning existing game', { gameId: game.id })
      return { status: 200, body: game }
    }
  }

  logger.info('Creating new game', { white, black })

  const players: Game['players'] = {
    white: { ai: white, model: models[white] },
    black: { ai: black, model: models[black] },
  }
  const newGame = await createGame(players, streams, logger)

  await streams.chessLiveAiGames.set('game', id, {
    id,
    gameId: newGame.id,
    createdAt: new Date().toISOString(),
    players: {
      white: { provider: white, model: models[white] },
      black: { provider: black, model: models[black] },
    },
  })

  await emit({
    topic: 'chess-game-created',
    data: { gameId: newGame.id, fenBefore: newGame.fen },
  })

  return { status: 200, body: newGame }
}
