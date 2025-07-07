import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { Game, gameSchema } from './streams/00-chess-game.stream'
import { generateGameScore } from '../../services/chess/generate-game-score'
import { GameMove } from './streams/00-chess-game-move.stream'
import { updateLeaderboard } from '../../services/chess/update-leaderboard'
import { analyzePlayerStrength } from '../../services/chess/analyze-player-strength'
import { Leaderboard } from '../../steps/chess/streams/00-chess-leaderboard.stream'

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
    let leaderboards: Record<string, Leaderboard> = {}

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

          leaderboards = await updateLeaderboard(game as Game, leaderboards, scoreboard, { skipAnalysis: true })

          logger.info('[EvaluateAllGames] leaderboard updated', { gameId: game.id })
        }
      }
    }
    
    const groupId = 'global'

    for (const model of Object.keys(leaderboards)) {
      const analysis = analyzePlayerStrength(leaderboards[model].averageEvals)
      await streams.chessLeaderboard.set(groupId, model, {
        ...leaderboards[model],
        analysis
      })
    }
    
    return { status: 200, body: { status: 'success' } }
  } catch (error) {
    return { status: 500, body: { message: 'Error evaluating games' } }
  }
}
