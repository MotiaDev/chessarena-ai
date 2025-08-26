import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { models } from '../../services/ai/models'
import { generateGameScore } from '../../services/chess/generate-game-score'
import { Scoreboard } from '@chessarena/types/game'
import { Leaderboard } from '@chessarena/types/leaderboard'
import { isAiGame } from '../../services/chess/utils'

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

export const handler: Handlers['GameEnded'] = async (input, { logger, streams }) => {
  logger.info('Received chess-game-ended event', { gameId: input.gameId })

  // We need to wait a few seconds to make sure the moves are evaluated
  await new Promise((resolve) => setTimeout(resolve, 8000))

  const game = await streams.chessGame.get('game', input.gameId)

  if (!game) {
    logger.error('Game not found', { gameId: input.gameId })
    return
  }

  const moves = await streams.chessGameMove.getGroup(input.gameId)
  const scoreboard = generateGameScore(moves)

  await streams.chessGame.set('game', game.id, { ...game, scoreboard })

  if (!isAiGame(game)) {
    return
  }

  // let's delete the live AI game session
  await streams.chessLiveAiGames.delete('game', game.id)

  /*
   * Initially, we're going to have only a global leaderboard
   * But we want to have a weekly or monthly leaderboard at some point
   */
  const groupId = 'global'
  // NOTE: I am leaving the default to be the models object reference to have backwards compatibility for active games previous to this change
  const whiteModel = game.players.white.model ?? models[game.players.white.ai!]
  const blackModel = game.players.black.model ?? models[game.players.black.ai!]
  const whiteLeaderboard = await streams.chessLeaderboard.get(groupId, whiteModel)
  const blackLeaderboard = await streams.chessLeaderboard.get(groupId, blackModel)

  const overrideLeaderboard = (
    color: 'white' | 'black',
    model: string,
    score: Scoreboard,
    leaderboard: Leaderboard | null,
  ): Leaderboard => {
    const player = color === 'white' ? 'white' : 'black'
    const otherPlayer = color === 'white' ? 'black' : 'white'
    const playerScore = score[player]
    const otherPlayerScore = score[otherPlayer]
    const playerIllegalMoves = game.players[player].illegalMoveAttempts ?? 0
    const provider = game.players[player].ai!

    const finalPlayerScore = playerScore.finalCentipawnScore
    const finalOtherPlayerScore = otherPlayerScore.finalCentipawnScore

    let winner = game.winner

    if (!winner) {
      if (finalPlayerScore > finalOtherPlayerScore) {
        winner = player
      } else if (finalPlayerScore < finalOtherPlayerScore) {
        winner = otherPlayer
      }
    }

    return {
      id: model,
      provider,
      model,
      ...(leaderboard ?? {}),
      gamesPlayed: (leaderboard?.gamesPlayed ?? 0) + 1,
      victories: (leaderboard?.victories ?? 0) + (winner === color ? 1 : 0),
      checkmates: (leaderboard?.checkmates ?? 0) + (game.winner === color ? 1 : 0),
      draws: (leaderboard?.draws ?? 0) + (winner === undefined ? 1 : 0),
      illegalMoves: (leaderboard?.illegalMoves ?? 0) + playerIllegalMoves,
      sumCentipawnScores: (leaderboard?.sumCentipawnScores ?? 0) + playerScore.finalCentipawnScore,
      sumHighestSwing: (leaderboard?.sumHighestSwing ?? 0) + playerScore.highestSwing,
    }
  }

  await streams.chessLeaderboard.set(
    groupId,
    whiteModel,
    overrideLeaderboard('white', whiteModel, scoreboard, whiteLeaderboard),
  )
  await streams.chessLeaderboard.set(
    groupId,
    blackModel,
    overrideLeaderboard('black', blackModel, scoreboard, blackLeaderboard),
  )
}
