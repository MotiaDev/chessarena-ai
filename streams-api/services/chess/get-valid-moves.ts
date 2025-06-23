import { Chess, SQUARES } from 'chess.js'
import { Game } from '../../steps/chess/streams/00-chess-game.stream'

type Move = { from: string; to: string[] }

export const getValidMoves = (game: Game): Move[] => {
  const chess = new Chess(game.fen)
  const dests: Move[] = []
  const currentTurn = game.turn === 'white' ? 'w' : 'b'

  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true })
    const piece = chess.get(s)

    if (piece && piece.color === currentTurn && ms.length) {
      dests.push({ from: s, to: ms.map((m) => m.to) })
    }
  })

  return dests
}
