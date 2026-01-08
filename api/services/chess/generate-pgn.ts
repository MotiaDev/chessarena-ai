import { Chess } from 'chess.js'
import type { Game } from '@chessarena/types/game'
import type { GameMove } from '@chessarena/types/game-move'

type PgnOptions = {
  game: Game
  moves: GameMove[]
}

const detectPromotion = (fenBefore: string, fenAfter: string, to: string): string | undefined => {
  // Check if a pawn moved to the back rank (promotion)
  const toRank = to[1]
  if (toRank !== '1' && toRank !== '8') return undefined

  // Parse the piece at destination in fenAfter to detect what it promoted to
  const afterBoard = fenAfter.split(' ')[0]
  const file = to.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = toRank === '8' ? 0 : 7

  const rows = afterBoard.split('/')
  let col = 0
  for (const char of rows[rank]) {
    if (col === file) {
      const piece = char.toLowerCase()
      if (['q', 'r', 'b', 'n'].includes(piece)) {
        return piece
      }
      break
    }
    if (/\d/.test(char)) {
      col += parseInt(char)
    } else {
      col++
    }
  }
  return undefined
}

export const generatePgn = ({ game, moves }: PgnOptions): string => {
  const chess = new Chess()

  // Replay all moves to build the game
  for (const move of moves) {
    const from = move.lastMove[0]
    const to = move.lastMove[1]

    try {
      const promotion = detectPromotion(move.fenBefore, move.fenAfter, to)
      chess.move({ from, to, promotion })
    } catch {
      // Skip invalid moves (shouldn't happen with valid history)
    }
  }

  // Build PGN headers
  const headers: Record<string, string> = {
    Event: 'ChessArena.ai Benchmark',
    Site: 'https://chessarena.ai',
    Date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    Round: '1',
    White: game.players.white.ai ? `${game.players.white.ai} (${game.players.white.model || 'unknown'})` : 'Human',
    Black: game.players.black.ai ? `${game.players.black.ai} (${game.players.black.model || 'unknown'})` : 'Human',
    Result: game.winner === 'white' ? '1-0' : game.winner === 'black' ? '0-1' : '1/2-1/2',
    Variant: game.variant || 'guided',
  }

  if (game.endGameReason) {
    headers.Termination = game.endGameReason
  }

  // Set headers on chess instance
  for (const [key, value] of Object.entries(headers)) {
    chess.header(key, value)
  }

  return chess.pgn()
}
