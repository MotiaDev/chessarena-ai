import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'ChessGameMoved',
  description: 'Chess Game Moved',
  subscribes: ['chess-game-moved', 'chess-game-created'],
  emits: ['ai-move'],
  flows: ['chess'],
  input: z.object({
    gameId: z.string({ description: 'The ID of the game' }),
    fenBefore: z.string({ description: 'The FEN of the game before the move' }),
  }),
}

export const handler: Handlers['ChessGameMoved'] = async (input, { logger, emit, streams }) => {
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
    await emit({
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
