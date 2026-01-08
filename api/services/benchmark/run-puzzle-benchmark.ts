import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { Chess } from 'chess.js'
import { z } from 'zod'
import { generateText } from 'ai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { LichessPuzzle, PuzzleResult, PuzzleBenchmarkRun, PuzzleTheme } from '@chessarena/types/puzzle-benchmark'
import { getBenchmarkProviderOptions } from '../ai/provider-options'
import { getBenchmarkConfig } from './benchmark-config'
import { withRetries, withRetriesNoTimeout } from './retry'
import { mapWithConcurrency, parsePositiveInt } from './concurrency'
import { createProviderModel, shouldDisableTimeout } from './shared-utils'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../../steps/chess/puzzle-benchmark.mustache'), 'utf8')

const PuzzleMoveResponseSchema = z.object({
  move: z.string().describe('The best move in Standard Algebraic Notation'),
})

type ProviderOptions = Record<string, unknown>

const extractMoveFromText = (text: string, legalMoves: string[], logger?: Logger): { move: string } | null => {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = fenceMatch?.[1] ?? text

  // Try JSON first
  try {
    const parsed = JSON.parse(candidate)
    const validated = PuzzleMoveResponseSchema.safeParse(parsed)
    if (validated.success) return { move: validated.data.move.trim() }
  } catch (e) {
    // JSON parsing failed, will try other extraction methods
    logger?.debug('JSON parsing failed, trying alternative extraction', {
      error: e instanceof Error ? e.message : 'unknown',
    })
  }

  // Try extracting JSON object substring
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const slice = candidate.slice(start, end + 1)
    try {
      const parsed = JSON.parse(slice)
      const validated = PuzzleMoveResponseSchema.safeParse(parsed)
      if (validated.success) return { move: validated.data.move.trim() }
    } catch (e) {
      // Substring JSON parsing also failed
      logger?.debug('Substring JSON parsing failed', { error: e instanceof Error ? e.message : 'unknown' })
    }
  }

  // Regex fallbacks
  const quoted = candidate.match(/"move"\s*:\s*"([^"]+)"/i)
  if (quoted?.[1]) return { move: quoted[1].trim() }

  const loose = candidate.match(/\bmove\b\s*[:=]\s*("?)([^"\n\r]+)\1/i)
  if (loose?.[2]) return { move: loose[2].trim() }

  let best: { move: string; idx: number } | undefined
  for (const m of legalMoves) {
    const idx = candidate.indexOf(m)
    if (idx === -1) continue
    if (!best || idx < best.idx) best = { move: m, idx }
  }
  if (best) return { move: best.move.trim() }

  return null
}

const getPuzzleMaxOutputTokens = (provider: AiModelProvider, model: string, base: number): number => {
  if (provider === 'openai' && model.startsWith('gpt-5')) return Math.max(base, 384)
  if (provider === 'gemini' && model.startsWith('gemini-3')) return Math.max(base, 384)
  return base
}

const getThemeDescription = (theme: PuzzleTheme): string => {
  switch (theme) {
    case 'mateIn1':
      return 'Mate in 1'
    case 'oneMove':
      return 'One Move'
    default:
      return theme
  }
}

/**
 * Build provider-specific options for puzzle benchmarks
 */
const buildProviderOptions = (
  provider: AiModelProvider,
  model: string,
  providerOptionsBase: ProviderOptions,
): ProviderOptions => {
  if (provider === 'gemini') {
    const googleBase = (providerOptionsBase?.google ?? {}) as Record<string, unknown>
    return {
      ...providerOptionsBase,
      google: {
        ...googleBase,
        responseMimeType: 'text/plain',
        thinkingConfig: { thinkingBudget: model.includes('pro') ? 128 : 0 },
      },
    }
  }

  if (provider === 'openai' && (model === 'gpt-5' || model === 'gpt-5.1' || model === 'gpt-5.2')) {
    const openaiBase = (providerOptionsBase?.openai ?? {}) as Record<string, unknown>
    return {
      ...providerOptionsBase,
      openai: {
        ...openaiBase,
        reasoningEffort: model === 'gpt-5' ? 'minimal' : 'none',
      },
    }
  }

  return providerOptionsBase
}

/**
 * Run benchmark for a single puzzle
 */
const benchmarkPuzzle = async (
  puzzle: LichessPuzzle,
  theme: PuzzleTheme,
  provider: AiModelProvider,
  model: string,
  logger: Logger,
): Promise<PuzzleResult> => {
  const chess = new Chess(puzzle.fen)
  const turn = chess.turn() === 'w' ? 'WHITE' : 'BLACK'

  const prompt = mustache.render(
    promptTemplate,
    {
      pgn: puzzle.pgn,
      fen: puzzle.fen,
      turn,
      legalMoves: puzzle.legalMoves,
      theme: getThemeDescription(theme),
    },
    {},
    { escape: (v: string) => v },
  )

  const startTime = Date.now()
  let rawResponse = ''
  let modelMove: string | undefined
  let error: string | undefined

  try {
    const cfg = getBenchmarkConfig()
    const providerModel = createProviderModel(provider, model)
    const disableTimeout = shouldDisableTimeout(provider, model)
    const providerOptionsBase = getBenchmarkProviderOptions(provider, model)
    const providerOptions = buildProviderOptions(provider, model, providerOptionsBase)
    const maxOutputTokens = getPuzzleMaxOutputTokens(provider, model, cfg.maxOutputTokens)

    const label = `${provider}/${model}`
    const result = disableTimeout
      ? await withRetriesNoTimeout(label, cfg.transientRetries, cfg.retryBaseBackoffMs, async () => {
          return await generateText({
            model: providerModel,
            prompt,
            maxRetries: 0,
            maxOutputTokens,
            providerOptions,
          })
        })
      : await withRetries(
          label,
          startTime + cfg.perItemTimeoutMs,
          cfg.transientRetries,
          cfg.retryBaseBackoffMs,
          async (abortSignal) => {
            return await generateText({
              model: providerModel,
              prompt,
              maxRetries: 0,
              abortSignal,
              maxOutputTokens,
              providerOptions,
            })
          },
        )

    const text = result.text ?? ''
    // Handle cases where response might be in a different property
    const resultWithResponse = result as { response?: unknown }
    const responseFallback =
      !text.trim() && resultWithResponse?.response ? JSON.stringify(resultWithResponse.response) : ''
    const candidate = text.trim() ? text : responseFallback

    rawResponse = candidate.slice(0, 20_000)

    if (!candidate.trim()) {
      error = 'Empty response'
    } else {
      const extracted = extractMoveFromText(candidate, puzzle.legalMoves, logger)
      if (extracted) {
        modelMove = extracted.move
      } else {
        error = 'Could not parse JSON response'
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
    logger.error('Puzzle benchmark failed', { error, puzzleId: puzzle.id })
  }

  const responseTime = Date.now() - startTime
  const isCorrect = modelMove === puzzle.solutionSan

  return {
    puzzleId: puzzle.id,
    modelMove,
    correctMove: puzzle.solutionSan,
    isCorrect,
    responseTime,
    rawResponse,
    error,
  }
}

/**
 * Run full puzzle benchmark for a model
 */
export const runPuzzleBenchmark = async (
  puzzles: LichessPuzzle[],
  puzzleSetId: string,
  theme: PuzzleTheme,
  provider: AiModelProvider,
  model: string,
  logger: Logger,
  onProgress?: (completed: number, total: number) => void,
): Promise<PuzzleBenchmarkRun> => {
  const runId = crypto.randomUUID()

  logger.info('Starting puzzle benchmark', {
    runId,
    provider,
    model,
    theme,
    puzzleCount: puzzles.length,
  })

  const run: PuzzleBenchmarkRun = {
    id: runId,
    createdAt: Date.now(),
    status: 'running',
    provider,
    model,
    puzzleSetId,
    theme,
    results: [],
    totalPuzzles: puzzles.length,
  }

  const puzzleConcurrency = parsePositiveInt(process.env.BENCHMARK_PUZZLE_CONCURRENCY, 1)
  let completed = 0

  run.results = await mapWithConcurrency(
    puzzles,
    puzzleConcurrency,
    async (puzzle) => benchmarkPuzzle(puzzle, theme, provider, model, logger),
    () => {
      completed++
      onProgress?.(completed, puzzles.length)
      if (completed === puzzles.length || completed % 10 === 0) {
        logger.info('Puzzle benchmark progress', { runId, provider, model, theme, completed, total: puzzles.length })
      }
    },
  )

  // Calculate aggregate scores
  const correctCount = run.results.filter((r) => r.isCorrect).length
  run.correctCount = correctCount
  run.accuracy = puzzles.length > 0 ? (correctCount / puzzles.length) * 100 : 0
  run.completedAt = Date.now()
  run.status = 'completed'

  logger.info('Puzzle benchmark completed', {
    runId,
    correctCount,
    accuracy: run.accuracy,
  })

  return run
}
