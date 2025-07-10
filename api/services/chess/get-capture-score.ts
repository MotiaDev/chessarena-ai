import { PieceSymbol } from 'chess.js'

const scoreMap: Record<PieceSymbol, number> = {
  k: 0, // King is not considered because it's checkmate already
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
}

export const getCaptureScore = (piece: PieceSymbol) => scoreMap[piece] || 0
