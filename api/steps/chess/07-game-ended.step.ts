import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { models } from '../../services/ai/models'
import { evaluateGame } from '../../services/chess/evaluate-game'

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
  
  if (!game.winner) {
    logger.error('Game has no winner', { gameId: input.gameId })
    return
  }

  if (game.players.white.ai && game.players.black.ai) {
    /*
     * Initially, we're going to have only a global leaderboard
     * But we want to have a weekly or monthly leaderboard at some point
     */
    const groupId = 'global'
    const rankingWhite = await streams.chessLeaderboard.get(groupId, game.players.white.ai)
    const rankingBlack = await streams.chessLeaderboard.get(groupId, game.players.black.ai)

    const whiteGamesPlayed = rankingWhite?.gamesPlayed ?? 0
    const blackGamesPlayed = rankingBlack?.gamesPlayed ?? 0
    const whiteWins = rankingWhite?.wins ?? 0
    const blackWins = rankingBlack?.wins ?? 0
    const whiteDraws = rankingWhite?.draws ?? 0
    const blackDraws = rankingBlack?.draws ?? 0

    const whiteIllegalMoves = rankingWhite?.illegalMoves ?? 0
    const blackIllegalMoves = rankingBlack?.illegalMoves ?? 0

    const whiteModel = models[game.players.white.ai]
    const blackModel = models[game.players.black.ai]

    await Promise.all([
      streams.chessLeaderboard.set(groupId, whiteModel, {
        provider: game.players.white.ai,
        model: whiteModel,
        gamesPlayed: whiteGamesPlayed + 1,
        wins: whiteWins + (game.winner === 'white' ? 1 : 0),
        draws: whiteDraws + (game.status === 'draw' ? 1 : 0),
        illegalMoves: whiteIllegalMoves + (game.players.white.illegalMoveAttempts ?? 0),
      }),
      streams.chessLeaderboard.set(groupId, blackModel, {
        provider: game.players.black.ai,
        model: blackModel,
        gamesPlayed: blackGamesPlayed + 1,
        wins: blackWins + (game.winner === 'black' ? 1 : 0),
        draws: blackDraws + (game.status === 'draw' ? 1 : 0),
        illegalMoves: blackIllegalMoves + (game.players.black.illegalMoveAttempts ?? 0),
      }),
    ])
  }
}
