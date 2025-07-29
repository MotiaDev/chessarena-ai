import { Chess, Move as ChessMove } from 'chess.js'
import { getCaptureScore } from './get-capture-score'

export const evaluateMove = (chessInstance: Chess, move: ChessMove) => {
  const isCheck = chessInstance.isCheck()
  const isCheckmate = chessInstance.isCheckmate()
  const isCapture = move.captured !== undefined
  const isPromotion = move.promotion !== undefined
  const isCastling = move.isKingsideCastle() || move.isQueensideCastle()
  const isEnPassant = move.isEnPassant()

  // Base score starts at 0
  let score = 0

  // Add points for captures (using the existing getCaptureScore function)
  const captureScore = move.captured ? getCaptureScore(move.captured) : 0
  score += captureScore

  // Add points for checks
  if (isCheck) {
    score += 1

    // Bonus for checkmate
    if (isCheckmate) {
      score += 1000 // Arbitrarily high value for checkmate
    }
  }

  // Add points for promotions
  if (isPromotion) {
    // Promote to queen is the most common and powerful
    score += move.promotion === 'q' ? 9 : 5
  }

  // Add points for castling (king safety)
  if (isCastling) {
    score += 2
  }

  // Add points for developing minor pieces (knights and bishops)
  if (
    (move.piece === 'n' || move.piece === 'b') &&
    ((move.color === 'w' && move.from[1] === '1') || (move.color === 'b' && move.from[1] === '8'))
  ) {
    score += 1
  }

  // Penalize moving pieces to squares controlled by opponent's pawns
  const opponentPawnAttacks = getPawnAttacks(chessInstance, move.color === 'w' ? 'b' : 'w')
  if (opponentPawnAttacks.has(move.to)) {
    score -= 1
  }

  return {
    color: move.color === 'w' ? 'white' : 'black',
    from: move.from,
    to: move.to,
    score,
    captureScore,
    isCheck,
    isCheckmate,
    isCapture,
    isPromotion,
    isCastling,
    isEnPassant,
  }
}

function getPawnAttacks(chess: Chess, color: 'w' | 'b'): Set<string> {
  const attacks = new Set<string>()
  const board = chess.board()
  const direction = color === 'w' ? 1 : -1

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = board[i][j]
      if (square && square.type === 'p' && square.color === color) {
        const rank = 8 - i
        // Add diagonal squares that pawns attack
        if (color === 'w') {
          if (j > 0) attacks.add(`${String.fromCharCode(96 + j)}${rank + 1}`)
          if (j < 7) attacks.add(`${String.fromCharCode(98 + j)}${rank + 1}`)
        } else {
          if (j > 0) attacks.add(`${String.fromCharCode(96 + j)}${rank - 1}`)
          if (j < 7) attacks.add(`${String.fromCharCode(98 + j)}${rank - 1}`)
        }
      }
    }
  }

  return attacks
}
