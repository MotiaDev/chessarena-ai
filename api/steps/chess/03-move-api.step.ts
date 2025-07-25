import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { move } from '../../services/chess/move'
import { validateMoveAccess } from '../../services/chess/validate-move-access'
import { gameSchema } from './streams/00-chess-game.stream'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'MovePiece',
  description: 'Move a piece',
  path: '/chess/game/:id/move',
  method: 'POST',
  emits: ['chess-game-moved', 'chess-game-ended', 'evaluate-player-move'],
  flows: ['chess'],
  bodySchema: z.object({
    password: z.string({ description: 'The password for the game' }),
    promote: z.enum(['queen', 'rook', 'bishop', 'knight']).optional(),
    from: z.string({ description: 'The square to move from' }),
    to: z.string({ description: 'The square to move to' }),
  }),
  responseSchema: {
    200: gameSchema,
    404: z.object({ message: z.string() }),
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['MovePiece'] = async (req, { logger, emit, streams, state }) => {
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

  const isValid = await validateMoveAccess({ state, gameId, game, password: req.body.password })

  if (!isValid) {
    return { status: 400, body: { message: 'Invalid password' } }
  }

  try {
    const newGame = await move({
      logger,
      streams,
      gameId,
      game,
      player: game.turn,
      action: { from: req.body.from, to: req.body.to, promote: req.body.promote },
      emit,
    })

    logger.info('Move made', { from: req.body.from, to: req.body.to })

    return { status: 200, body: newGame }
  } catch (error) {
    return { status: 400, body: { message: 'Invalid move' } }
  }
}
