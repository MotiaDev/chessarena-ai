import { GameSchema } from '@chessarena/types/game'
import { api, type Handlers, type StepConfig } from 'motia'
import * as z from 'zod'
import { getGameRole } from '../../services/chess/get-game-role'
import { move } from '../../services/chess/move'
import { auth } from '../middlewares/auth.middleware'

export const config = {
  name: 'MovePiece',
  description: 'Move a piece',
  flows: ['chess'],
  triggers: [
    api('POST', '/chess/game/:id/move', {
      bodySchema: z
        .object({
          moveSan: z.string().describe('The move in Standard Algebraic Notation (SAN)'),
        })
        .strict(),
      responseSchema: {
        200: GameSchema,
        404: z.object({ message: z.string() }).strict(),
        400: z.object({ message: z.string() }).strict(),
      },
      middleware: [auth({ required: true })],
    }),
  ],
  enqueues: ['chess-game-moved', 'chess-game-ended', 'evaluate-player-move'],
  virtualEnqueues: [],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (req, { logger, enqueue, streams }) => {
  logger.info('Received move event', { body: req.body })

  const gameId = req.pathParams.id
  const game = await streams.chessGame.get('game', gameId)

  if (!game) {
    return { status: 404, body: { message: 'Game not found' } }
  } else if (game.status === 'completed') {
    return { status: 400, body: { message: 'Game is finished' } }
  } else if (game.players[game.turn].ai) {
    return { status: 400, body: { message: 'Cannot move as AI' } }
  }

  const role = getGameRole(game, req.tokenInfo?.sub)

  if (role === 'spectator') {
    return { status: 400, body: { message: 'Spectators cannot move' } }
  } else if (role !== game.turn) {
    return { status: 400, body: { message: 'It is not your turn' } }
  }

  try {
    const newGame = await move({
      logger,
      streams,
      gameId,
      game,
      player: game.turn,
      moveSan: req.body.moveSan,
      enqueue,
    })

    logger.info('Move made', req.body.moveSan)

    return { status: 200, body: newGame }
  } catch (error) {
    logger.error('Invalid move', { error })
    return { status: 400, body: { message: 'Invalid move' } }
  }
}
