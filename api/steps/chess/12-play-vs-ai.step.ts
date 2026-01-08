import { GameSchema } from '@chessarena/types/game'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { createGame } from '../../services/chess/create-game'
import { selectRandomAI } from '../../services/ai/random-ai-selection'
import { auth } from '../middlewares/auth.middleware'
import { UserState } from '../states/user-state'

const bodySchema = z.object({
  playerColor: z.enum(['white', 'black', 'random']).default('random'),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'PlayVsAI',
  description: 'Start a game against a randomly selected AI opponent',
  path: '/chess/play-vs-ai',
  method: 'POST',
  emits: ['chess-game-created'],
  flows: ['chess'],
  bodySchema,
  middleware: [auth({ required: true })],
  responseSchema: {
    200: z.object({
      game: GameSchema,
      opponent: z.object({
        provider: z.string(),
        model: z.string(),
        tier: z.string(),
      }),
      playerColor: z.enum(['white', 'black']),
    }),
    401: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['PlayVsAI'] = async (req, { logger, emit, state, streams }) => {
  logger.info('[PlayVsAI] Starting human vs AI game')

  const userState = new UserState(state)
  const user = await userState.getUser(req.tokenInfo.sub)

  if (!user) {
    logger.error('[PlayVsAI] User not found', { userId: req.tokenInfo.sub })
    return { status: 401, body: { message: 'User not found' } }
  }

  // Select random AI opponent
  const opponent = selectRandomAI()
  logger.info('[PlayVsAI] Selected AI opponent', opponent)

  // Determine player color
  let playerColor: 'white' | 'black' = req.body.playerColor as 'white' | 'black'
  if (req.body.playerColor === 'random') {
    playerColor = Math.random() < 0.5 ? 'white' : 'black'
  }

  // Create game with human vs AI
  const players =
    playerColor === 'white'
      ? {
          white: {}, // Human
          black: { ai: opponent.provider, model: opponent.model },
        }
      : {
          white: { ai: opponent.provider, model: opponent.model },
          black: {}, // Human
        }

  const game = await createGame(players, streams, logger, user, 'guided')

  logger.info('[PlayVsAI] Game created', {
    gameId: game.id,
    playerColor,
    opponent: `${opponent.provider}/${opponent.model}`,
  })

  await emit({
    topic: 'chess-game-created',
    data: { gameId: game.id, fenBefore: game.fen },
  })

  return {
    status: 200,
    body: {
      game,
      opponent,
      playerColor,
    },
  }
}
