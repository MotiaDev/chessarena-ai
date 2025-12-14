import { Chess } from 'chess.js'
import { Logger } from 'motia'
import { LichessPuzzle, PuzzleTheme } from '@chessarena/types/puzzle-benchmark'

type LichessApiResponse = {
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
 * Fetch a single puzzle from Lichess API
 */
const fetchSinglePuzzle = async (theme: PuzzleTheme, logger: Logger): Promise<LichessPuzzle | null> => {
  try {
    const response = await fetch(`https://lichess.org/api/puzzle/next?angle=${theme}`)

    if (!response.ok) {
      logger.error('Lichess API error', { status: response.status })
      return null
    }

    const data: LichessApiResponse = await response.json()

    // Replay the game to get the puzzle position
    const chess = new Chess()
    const moves = data.game.pgn.split(' ').filter((m) => !m.includes('.'))

    // Play moves up to initialPly
    for (let i = 0; i < data.puzzle.initialPly && i < moves.length; i++) {
      try {
        chess.move(moves[i])
      } catch {
        // Some moves might be invalid, skip
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
    logger.error('Failed to fetch puzzle', { error })
    return null
  }
}

/**
 * Fetch multiple unique puzzles from Lichess
 */
export const fetchPuzzles = async (theme: PuzzleTheme, count: number, logger: Logger): Promise<LichessPuzzle[]> => {
  const puzzles: LichessPuzzle[] = []
  const seenIds = new Set<string>()

  let attempts = 0
  const maxAttempts = count * 3

  logger.info('Fetching puzzles from Lichess', { theme, targetCount: count })

  while (puzzles.length < count && attempts < maxAttempts) {
    attempts++

    const puzzle = await fetchSinglePuzzle(theme, logger)

    if (puzzle && !seenIds.has(puzzle.id)) {
      seenIds.add(puzzle.id)
      puzzles.push(puzzle)
      logger.info('Fetched puzzle', {
        puzzleId: puzzle.id,
        progress: `${puzzles.length}/${count}`,
      })
    }

    // Rate limiting - wait 500ms between requests
    if (puzzles.length < count) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  logger.info('Finished fetching puzzles', { theme, fetched: puzzles.length })
  return puzzles
}
