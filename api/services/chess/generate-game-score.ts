import type { GameMove, MoveEvaluation } from '@chessarena/types/game-move'
import type { PlayerScore, Scoreboard } from '@chessarena/types/game'
import { average, highest } from './utils'

const generatePlayerScore = (moves: GameMove[], player: 'white' | 'black', game?: any): PlayerScore => {
  const evaluations: MoveEvaluation[] = moves
    .filter((move) => move.color === player)
    .map((move) => move.evaluation)
    .filter((evaluation) => !!evaluation)

  const swings = evaluations.map((evaluation) => evaluation.evaluationSwing)
  const centipawnScores = evaluations.map((evaluation) => evaluation.centipawnScore)
  const checks = moves.filter((move) => move.color === player && move.check).length

  return {
    averageSwing: Math.round(average(swings)),
    highestSwing: highest(swings),
    finalCentipawnScore: centipawnScores[centipawnScores.length - 1],
    blunders: evaluations.filter((evaluation) => evaluation.blunder).length,
    illegalMoveAttempts: game?.players?.[player]?.illegalMoveAttempts ?? 0,
    captures: game?.players?.[player]?.captures ?? [],
    promotions: game?.players?.[player]?.promotions ?? 0,
    checks,
  }
}

export const generateGameScore = (moves: GameMove[], game?: any): Scoreboard => {
  const firstMove = moves[0]

  if (!firstMove) {
    const defaultScore: PlayerScore = {
      averageSwing: 0,
      highestSwing: 0,
      finalCentipawnScore: 0,
      blunders: 0,
      illegalMoveAttempts: 0,
      captures: [],
      promotions: 0,
      checks: 0,
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

  const whiteScore = generatePlayerScore(moves, 'white', game)
  const blackScore = generatePlayerScore(moves, 'black', game)

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
