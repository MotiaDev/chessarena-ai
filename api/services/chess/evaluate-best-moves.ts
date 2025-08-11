import type { Game } from '@chessarena/types/game'
import { Chess } from 'chess.js'
import { evaluateMove } from './evaluate-move'

export const evaluateBestMoves = (game: Game) => {
  const chess = new Chess(game.fen)
  const moves = chess.moves({ verbose: true })

  // Evaluate all possible moves
  const moveEvaluations = moves.map((move) => {
    const evaluation = evaluateMove(chess, move)
    return { move, ...evaluation }
  })

  // Sort moves by score (highest first)
  const bestMoves = [...moveEvaluations].sort((a, b) => b.score - a.score)

  return bestMoves
}
