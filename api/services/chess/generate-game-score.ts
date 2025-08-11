import type { GameMove, MoveEvaluation } from '@chessarena/types/game-move'
import type { PlayerScore, Scoreboard } from '@chessarena/types/game'
import { average, highest, lowest, median } from './utils'

const generatePlayerScore = (moves: GameMove[], player: 'white' | 'black'): PlayerScore => {
  const evaluations: MoveEvaluation[] = moves
    .filter((move) => move.color === player)
    .map((move) => move.evaluation)
    .filter((evaluation) => !!evaluation)

  const swings = evaluations.map((evaluation) => evaluation.evaluationSwing)
  const centipawnScores = evaluations.map((evaluation) => evaluation.centipawnScore)

  return {
    averageSwing: Math.round(average(swings)),
    medianSwing: median(swings),
    highestSwing: highest(swings),
    highestCentipawnScore: highest(centipawnScores),
    lowestCentipawnScore: lowest(centipawnScores),
    averageCentipawnScore: Math.round(average(centipawnScores)),
    medianCentipawnScore: median(centipawnScores),
    finalCentipawnScore: centipawnScores[centipawnScores.length - 1],
    blunders: evaluations.filter((evaluation) => evaluation.blunder).length,
  }
}

export const generateGameScore = (moves: GameMove[]): Scoreboard => {
  const firstMove = moves[0]

  if (!firstMove) {
    const defaultScore: PlayerScore = {
      averageSwing: 0,
      medianSwing: 0,
      highestSwing: 0,
      highestCentipawnScore: 0,
      lowestCentipawnScore: 0,
      averageCentipawnScore: 0,
      medianCentipawnScore: 0,
      finalCentipawnScore: 0,
      blunders: 0,
    }

    return {
      black: defaultScore,
      white: defaultScore,
      totalMoves: 0,
      decisiveMoment: undefined,
    }
  }

  const highestSwingMove = moves.reduce((max, move) => {
    if (!move.evaluation) return max
    if (!max.evaluation) return move

    return max.evaluation.evaluationSwing > move.evaluation.evaluationSwing ? max : move
  }, firstMove)
  const moveNumber = moves.findIndex((move) => move === highestSwingMove) + 1

  const whiteScore = generatePlayerScore(moves, 'white')
  const blackScore = generatePlayerScore(moves, 'black')

  return {
    white: whiteScore,
    black: blackScore,
    totalMoves: moves.length,
    decisiveMoment: {
      moveNumber,
      evaluationSwing: highestSwingMove.evaluation!.evaluationSwing,
      move: highestSwingMove.lastMove,
      fen: highestSwingMove.fenAfter,
    },
  }
}
