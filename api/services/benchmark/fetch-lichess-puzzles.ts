import { Chess } from 'chess.js'
import { Logger } from 'motia'
import { LichessPuzzle, PuzzleTheme } from '@chessarena/types/puzzle-benchmark'

type LichessBatchPuzzle = {
  game: {
    id: string
    pgn: string
  }
  puzzle: {
    id: string
    rating: number
    themes: string[]
    solution: string[]
    initialPly: number
  }
}

type LichessBatchResponse = {
  puzzles: LichessBatchPuzzle[]
}

/**
 * Convert UCI move to SAN (e.g., "e2e4" -> "e4")
 */
const uciToSan = (chess: Chess, uci: string): string | null => {
  try {
    const from = uci.slice(0, 2)
    const to = uci.slice(2, 4)
    const promotion = uci.length > 4 ? uci[4] : undefined

    const move = chess.move({ from, to, promotion })
    if (move) {
      chess.undo() // Undo so we don't modify the position
      return move.san
    }
    return null
  } catch {
    return null
  }
}

/**
 * Parse a single puzzle from Lichess batch response
 */
const parsePuzzle = (data: LichessBatchPuzzle, logger: Logger): LichessPuzzle | null => {
  try {
    const chess = new Chess()
    const moves = data.game.pgn.split(' ').filter((m) => !m.includes('.') && m.length > 0)

    // Play moves up to initialPly
    for (let i = 0; i < data.puzzle.initialPly && i < moves.length; i++) {
      try {
        chess.move(moves[i])
      } catch {
        // Some moves might be invalid, skip
      }
    }

    // Play one more move (the setup move) - this is the opponent's last move before the puzzle
    if (moves.length > data.puzzle.initialPly) {
      try {
        chess.move(moves[data.puzzle.initialPly])
      } catch {
        logger.warn('Could not play setup move', { puzzleId: data.puzzle.id })
        return null
      }
    }

    const fen = chess.fen()
    const legalMoves = chess.moves().sort()

    // Convert first solution move to SAN
    const solutionSan = uciToSan(chess, data.puzzle.solution[0])
    if (!solutionSan) {
      logger.warn('Could not convert solution to SAN', { puzzleId: data.puzzle.id })
      return null
    }

    return {
      id: data.puzzle.id,
      rating: data.puzzle.rating,
      themes: data.puzzle.themes,
      solution: data.puzzle.solution,
      initialPly: data.puzzle.initialPly,
      pgn: data.game.pgn,
      fen,
      legalMoves,
      solutionSan,
    }
  } catch (error) {
    logger.error('Failed to parse puzzle', { error, puzzleId: data.puzzle.id })
    return null
  }
}

/**
 * Fetch puzzles from Lichess using batch API
 */
export const fetchPuzzles = async (theme: PuzzleTheme, count: number, logger: Logger): Promise<LichessPuzzle[]> => {
  logger.info('Fetching puzzles from Lichess batch API', { theme, count })

  try {
    // Use batch API - fetch more than needed to filter by theme
    const url = `https://lichess.org/api/puzzle/batch/${theme}?nb=${Math.min(count, 50)}`
    logger.info('Fetching from', { url })

    const response = await fetch(url)

    if (!response.ok) {
      logger.error('Lichess batch API error', { status: response.status })
      // Fallback: try the mix endpoint
      const mixUrl = `https://lichess.org/api/puzzle/batch/mix?nb=${Math.min(count, 50)}`
      logger.info('Trying mix endpoint', { mixUrl })
      const mixResponse = await fetch(mixUrl)

      if (!mixResponse.ok) {
        logger.error('Lichess mix API also failed', { status: mixResponse.status })
        return []
      }

      const mixData: LichessBatchResponse = await mixResponse.json()
      // Filter by theme
      const filtered = mixData.puzzles.filter((p) => p.puzzle.themes.includes(theme))
      const puzzles = filtered.map((p) => parsePuzzle(p, logger)).filter((p): p is LichessPuzzle => p !== null)

      logger.info('Fetched puzzles from mix endpoint', { total: puzzles.length })
      return puzzles.slice(0, count)
    }

    const data: LichessBatchResponse = await response.json()
    const puzzles = data.puzzles.map((p) => parsePuzzle(p, logger)).filter((p): p is LichessPuzzle => p !== null)

    logger.info('Fetched puzzles from batch API', { total: puzzles.length })
    return puzzles.slice(0, count)
  } catch (error) {
    logger.error('Failed to fetch puzzles', { error })
    return []
  }
}
