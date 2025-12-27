import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { Chess } from 'chess.js'
import { z } from 'zod'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createXai } from '@ai-sdk/xai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { LichessPuzzle, PuzzleResult, PuzzleBenchmarkRun, PuzzleTheme } from '@chessarena/types/puzzle-benchmark'
import { getBenchmarkProviderOptions } from '../ai/provider-options'
import { getBenchmarkConfig } from './benchmark-config'
import { withRetries, withRetriesNoTimeout } from './retry'
import { mapWithConcurrency, parsePositiveInt } from './concurrency'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../../steps/chess/puzzle-benchmark.mustache'), 'utf8')

const PuzzleMoveResponseSchema = z.object({
  move: z.string().describe('The best move in Standard Algebraic Notation'),
})

const extractMoveFromText = (text: string, legalMoves: string[]): { move: string } | null => {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = fenceMatch?.[1] ?? text

  // Try JSON first
  try {
    const parsed = JSON.parse(candidate)
    const validated = PuzzleMoveResponseSchema.safeParse(parsed)
    if (validated.success) return { move: validated.data.move.trim() }
  } catch {
    // continue
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
    } catch {
      // continue
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

const shouldDisableTimeout = (provider: AiModelProvider, model: string): boolean => {
  if (provider !== 'grok') return false
  const enabled = (process.env.BENCHMARK_GROK_DISABLE_TIMEOUT ?? 'true') === 'true'
  if (!enabled) return false
  return model.startsWith('grok-3') || model.startsWith('grok-4')
}

const getPuzzleMaxOutputTokens = (provider: AiModelProvider, model: string, base: number): number => {
  if (provider === 'openai' && model.startsWith('gpt-5')) return Math.max(base, 384)
  if (provider === 'gemini' && model.startsWith('gemini-3')) return Math.max(base, 384)
  return base
}

const createProviderModel = (provider: AiModelProvider, model: string) => {
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
      return openai(model)
    }
    case 'gemini': {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
      return google(model)
    }
    case 'claude': {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      return anthropic(model)
    }
    case 'grok': {
      const xai = createXai({ apiKey: process.env.XAI_API_KEY })
      return xai(model)
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
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
    const providerOptions =
      provider === 'gemini'
        ? {
            ...providerOptionsBase,
            google: {
              ...(providerOptionsBase as any)?.google,
              responseMimeType: 'text/plain',
              thinkingConfig: { thinkingBudget: model.includes('pro') ? 128 : 0 },
            },
          }
        : provider === 'openai' && (model === 'gpt-5' || model === 'gpt-5.1' || model === 'gpt-5.2')
          ? {
              ...providerOptionsBase,
              openai: {
                ...(providerOptionsBase as any)?.openai,
                reasoningEffort: model === 'gpt-5' ? 'minimal' : 'none',
              },
            }
          : providerOptionsBase

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
      : await withRetries(label, startTime + cfg.perItemTimeoutMs, cfg.transientRetries, cfg.retryBaseBackoffMs, async (abortSignal) => {
          return await generateText({
            model: providerModel,
            prompt,
            maxRetries: 0,
            abortSignal,
            maxOutputTokens,
            providerOptions,
          })
        })

    const text = result.text ?? ''
    const responseFallback = !text.trim() && (result as any)?.response ? JSON.stringify((result as any).response) : ''
    const candidate = text.trim() ? text : responseFallback

    rawResponse = candidate.slice(0, 20_000)

    if (!candidate.trim()) {
      error = 'Empty response'
    } else {
      const extracted = extractMoveFromText(candidate, puzzle.legalMoves)
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
