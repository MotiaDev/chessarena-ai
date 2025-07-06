import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { GameMove, MoveEvaluationSchema } from './streams/00-chess-game-move.stream'

export const config: EventConfig = {
  type: 'event',
  name: 'TrackMoveEvalScore',
  description: 'track the result from an ai step evaluation result',
  subscribes: ["player-move-score"],
  emits: [],
  input: MoveEvaluationSchema.extend({
    gameId: z.string(),
    moveId: z.string(),
    color: z.enum(['white', 'black']),
  }),
  flows: ["chess"]
}

export const handler: Handlers['TrackMoveEvalScore'] = async (input, { logger, streams }) => {
  logger.info('[TrackMoveEvalScore] received message', input)

  const {gameId, moveId, color, ...evaluation} = input

  const game = await streams.chessGame.get('game', gameId)

  if (!game) {
    logger.error('Game not found', { gameId })
    return
  }

  const move = await streams.chessGameMove.get(gameId, moveId)

  await streams.chessGameMove.set(gameId, moveId, {
    ...(move as GameMove),
    evaluation,
  })

  logger.info('[TrackMoveEvalScore] move updated with stockfish evaluation', { gameId, moveId, evaluation })
}