import { GameSchema } from '@chessarena/types/game'
import { ApiRouteConfig, Handlers, ZodInput } from 'motia'
import { z } from 'zod'
import { getGameRole } from '../../services/chess/get-game-role'
import { move } from '../../services/chess/move'
import { auth } from '../middlewares/auth.middleware'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'MovePiece',
  description: 'Move a piece',
  path: '/chess/game/:id/move',
  method: 'POST',
  emits: ['chess-game-moved', 'chess-game-ended', 'evaluate-player-move'],
  flows: ['chess'],
  middleware: [auth({ required: true })],
  bodySchema: z.object({
    moveSan: z.string({ description: 'The move in Standard Algebraic Notation (SAN)' }),
  }),
  responseSchema: {
    200: GameSchema as unknown as ZodInput,
    404: z.object({ message: z.string() }),
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['MovePiece'] = async (req, { logger, emit, streams }) => {
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
      emit,
    })

    logger.info('Move made', req.body.moveSan)

    return { status: 200, body: newGame }
  } catch (error) {
    return { status: 400, body: { message: 'Invalid move' } }
  }
}
