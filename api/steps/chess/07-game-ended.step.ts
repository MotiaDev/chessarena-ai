import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { generateGameScore } from '../../services/chess/generate-game-score'
import { Game } from './streams/00-chess-game.stream'
import { GameMove } from './streams/00-chess-game-move.stream'
import { updateLeaderboard } from '../../services/chess/update-leaderboard'

/*
 * Warning: This can lead to race conditions if two games end at the same time.
 *
 * We need to support FIFO queueing system in Motia to avoid this.
 */
export const config: EventConfig = {
  type: 'event',
  name: 'GameEnded',
  description: 'GameEnded',
  subscribes: ['chess-game-ended'],
  emits: [],
  flows: ['chess'],
  input: z.object({
    gameId: z.string({ description: 'The ID of the game' }),
  }),
}

export const handler: Handlers['GameEnded'] = async (input, { logger, emit, streams }) => {
  logger.info('Received chess-game-ended event', { gameId: input.gameId })

  const game = await streams.chessGame.get('game', input.gameId)

  if (!game) {
    logger.error('Game not found', { gameId: input.gameId })
    return
  } 
  
  if (game.status === 'pending') {
    logger.error('Game is not completed', { gameId: input.gameId })
    return
  }

  const moves = await streams.chessGameMove.getGroup(input.gameId)

  const {whiteScore, blackScore, scoreboard} = await generateGameScore(game as Game, moves as GameMove[])

  await streams.chessGame.set('game', input.gameId, {
    ...game,
    players: {
      ...game.players,
      white: {
        ...game.players.white,
        score: whiteScore
      },
      black: {
        ...game.players.black,
        score: blackScore
      }
    },
    scoreboard
  })

  await updateLeaderboard(game as Game, streams, scoreboard)
}
