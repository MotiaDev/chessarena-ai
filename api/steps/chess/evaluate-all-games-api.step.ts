import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { Game, gameSchema } from './streams/00-chess-game.stream'
import { generateGameScore } from '../../services/chess/generate-game-score'
import { GameMove } from './streams/00-chess-game-move.stream'
import { updateLeaderboard } from '../../services/chess/update-leaderboard'
import { analyzePlayerStrength } from '../../services/chess/analyze-player-strength'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'EvaluateAllGames',
  description: 'Evaluate all games',
  path: '/chess/evaluate-all-games',
  method: 'POST',
  emits: [],
  flows: ['chess'],
  bodySchema: z.object({}),
  responseSchema: {
    200: z.object({ status: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['EvaluateAllGames'] = async (req, { logger, streams }) => {
  logger.info('[EvaluateAllGames] Received evaluate-all-games event', { body: req.body })

  const games = await streams.chessGame.getGroup('game')

  if (!games) {
    return { status: 500, body: { message: 'Games not found' } }
  }

  try {
    for (const game of games) {
      if (['completed', 'draw'].includes(game.status)) {
        const moves = await streams.chessGameMove.getGroup(game.id)
      
        if (Array.isArray(moves)) {
          const {whiteScore, blackScore, scoreboard} = await generateGameScore(game as Game, moves as GameMove[])
      
          await streams.chessGame.set('game', game.id, {
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

          logger.info('[EvaluateAllGames] game evaluated', { gameId: game.id })

          await updateLeaderboard(game as Game, streams, scoreboard, { skipAnalysis: true })

          logger.info('[EvaluateAllGames] leaderboard updated', { gameId: game.id })
        }
      }
    }

    const leaderboards = await streams.chessLeaderboard.getGroup('global');

    console.log('leaderboards', leaderboards)

    for (const leaderboard of leaderboards) {
      logger.info('[EvaluateAllGames] leaderboard analysis')

      await streams.chessLeaderboard.set('global', leaderboard.model, {
        ...leaderboard,
        analysis: analyzePlayerStrength(leaderboard.averageEvals)
      })
    }
    
    return { status: 200, body: { status: 'success' } }
  } catch (error) {
    return { status: 500, body: { message: 'Error evaluating games' } }
  }
}
