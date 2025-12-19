import { Chess } from 'chess.js'
import { Logger } from 'motia'
import { LichessPuzzle, PuzzleTheme } from '@chessarena/types/puzzle-benchmark'

const LICHESS_BASE_URL = 'https://lichess.org'
const MAX_BATCH_SIZE = 50
const REQUEST_TIMEOUT_MS = 30000

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const parseRetryAfterMs = (value: string | null): number | null => {
  if (!value) return null
  const seconds = Number.parseInt(value, 10)
  if (Number.isFinite(seconds)) return seconds * 1000
  const dateMs = Date.parse(value)
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now())
  return null
}

const fetchJsonWithRetry = async <T>(
  url: string,
  logger: Logger,
  label: string,
  maxRetries = 6,
): Promise<T> => {
  const token = process.env.LICHESS_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let attempt = 0
  let backoffMs = 1000

  while (true) {
    attempt++
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (response.ok) {
      return (await response.json()) as T
    }

    const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'))
    const shouldRetry =
      attempt <= maxRetries && (response.status === 429 || response.status === 408 || (response.status >= 500 && response.status <= 599))

    if (!shouldRetry) {
      logger.error('Lichess API request failed', { label, url, status: response.status })
      throw new Error(`Lichess API error (${response.status})`)
    }

    const waitMs = retryAfterMs ?? backoffMs
    logger.warn('Lichess API rate limited / transient error, retrying', { label, url, status: response.status, attempt, waitMs })
    await sleep(waitMs + Math.floor(Math.random() * 250))
    backoffMs = Math.min(backoffMs * 2, 30000)
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
 * Fetch puzzles from Lichess using batch API.
 * Uses /api/puzzle/batch/mix and filters by theme to avoid enumerating.
 */
export const fetchPuzzles = async (theme: PuzzleTheme, count: number, logger: Logger): Promise<LichessPuzzle[]> => {
  const nb = Math.min(MAX_BATCH_SIZE, Math.max(1, Math.max(15, count)))
  const target = Math.max(1, count)

  const seenIds = new Set<string>()
  const results: LichessPuzzle[] = []

  const maxRequests = Math.max(3, Math.ceil((target / Math.max(1, nb)) * 6))
  logger.info('Fetching puzzles from Lichess', { theme, count: target, nb, maxRequests, authenticated: Boolean(process.env.LICHESS_TOKEN) })

  for (let req = 1; req <= maxRequests && results.length < target; req++) {
    // Prefer the themed endpoint (faster to hit the theme we want).
    // Fallback to mix if it fails (e.g. unknown angle).
    const themedUrl = `${LICHESS_BASE_URL}/api/puzzle/batch/${theme}?nb=${nb}`
    const mixUrl = `${LICHESS_BASE_URL}/api/puzzle/batch/mix?nb=${nb}`

    let data: LichessBatchResponse
    try {
      data = await fetchJsonWithRetry<LichessBatchResponse>(themedUrl, logger, 'puzzle-batch-themed')
    } catch (error) {
      logger.warn('Themed puzzle batch failed, falling back to mix', { theme, error })
      try {
        data = await fetchJsonWithRetry<LichessBatchResponse>(mixUrl, logger, 'puzzle-batch-mix')
      } catch (error2) {
        logger.error('Failed to fetch puzzles batch', { error: error2 })
        break
      }
    }

    const candidates = data.puzzles

    for (const item of candidates) {
      if (seenIds.has(item.puzzle.id)) continue
      seenIds.add(item.puzzle.id)

      // When we fall back to mix, keep filtering by theme.
      if (data !== undefined && item.puzzle.themes && item.puzzle.themes.length > 0) {
        // If the response came from the themed endpoint, it should already match. Filtering is harmless.
        if (!item.puzzle.themes.includes(theme)) continue
      }

      const parsed = parsePuzzle(item, logger)
      if (!parsed) continue
      results.push(parsed)
      if (results.length >= target) break
    }

    logger.info('Fetched puzzles batch', { theme, req, got: results.length, target })
  }

  return results.slice(0, target)
}
