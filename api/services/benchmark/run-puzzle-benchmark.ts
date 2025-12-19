import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { Chess } from 'chess.js'
import { z } from 'zod'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createXai } from '@ai-sdk/xai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { LichessPuzzle, PuzzleResult, PuzzleBenchmarkRun, PuzzleTheme } from '@chessarena/types/puzzle-benchmark'
import { getMaxReasoningProviderOptions } from '../ai/provider-options'
import { mapWithConcurrency, parsePositiveInt } from './concurrency'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../../steps/chess/puzzle-benchmark.mustache'), 'utf8')

const PuzzleMoveResponseSchema = z.object({
  move: z.string().describe('The best move in Standard Algebraic Notation'),
})

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
    const providerModel = createProviderModel(provider, model)

    const { object } = await generateObject({
      model: providerModel,
      prompt,
      schema: PuzzleMoveResponseSchema,
      mode: provider === 'claude' || provider === 'grok' ? 'json' : undefined,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(60000),
      providerOptions: getMaxReasoningProviderOptions(provider, model),
    })

    rawResponse = JSON.stringify(object)
    modelMove = object.move?.trim()
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
