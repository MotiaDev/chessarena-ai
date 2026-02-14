import { type Handlers, queue, type StepConfig } from 'motia'
import * as z from 'zod'

const inputSchema = z.object({
  gameId: z.string().describe('The ID of the game'),
  fenBefore: z.string().describe('The FEN of the game before the move'),
})

export const config = {
  name: 'ChessGameMoved',
  description: 'Chess Game Moved',
  flows: ['chess'],
  triggers: [queue('chess-game-moved', { input: inputSchema }), queue('chess-game-created', { input: inputSchema })],
  enqueues: ['ai-move'],
  virtualEnqueues: [],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (input, { logger, enqueue, streams }) => {
  logger.info('Received ChessGameMoved event', { input })

  const game = await streams.chessGame.get('game', input.gameId)

  if (!game) {
    logger.error('Game not found', { gameId: input.gameId })
    return
  }

  if (game.status === 'completed') {
    logger.info('Game is completed', { gameId: input.gameId })
    return
  }

  const turnPlayer = game.turn === 'white' ? game.players.white : game.players.black

  if (turnPlayer.ai) {
    await enqueue({
      topic: 'ai-move',
      data: {
        fen: game.fen,
        fenBefore: input.fenBefore,
        lastMove: game.lastMove,
        check: game.check,
        gameId: input.gameId,
        player: game.turn,
      },
    })
  } else {
    logger.info('No AI player found', { gameId: input.gameId })
  }
}
