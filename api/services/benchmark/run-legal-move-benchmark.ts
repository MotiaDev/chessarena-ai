import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { Chess } from 'chess.js'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { TestPosition, ModelBenchmarkResult, LegalMoveBenchmarkRun } from '@chessarena/types/legal-move-benchmark'
import { makeBenchmarkPrompt } from './benchmark-prompt'
import { getBenchmarkConfig } from './benchmark-config'
import { mapWithConcurrency, parsePositiveInt } from './concurrency'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../../steps/chess/legal-move-benchmark.mustache'), 'utf8')

type GeneratePositionsOptions = {
  count: number
  minLegalMoves: number
  maxLegalMoves: number
  minMoveNumber: number
  maxMoveNumber: number
}

const DEFAULT_OPTIONS: GeneratePositionsOptions = {
  count: 20,
  minLegalMoves: 5,
  maxLegalMoves: 25,
  minMoveNumber: 8,
  maxMoveNumber: 60,
}

/**
 * Generate a single random position by playing random moves
 */
const generateRandomPosition = (options: GeneratePositionsOptions): TestPosition | null => {
  const chess = new Chess()

  const targetMoves =
    Math.floor(Math.random() * (options.maxMoveNumber - options.minMoveNumber + 1)) + options.minMoveNumber

  for (let i = 0; i < targetMoves; i++) {
    const moves = chess.moves()
    if (moves.length === 0) return null
    const randomMove = moves[Math.floor(Math.random() * moves.length)]
    chess.move(randomMove)
  }

  if (chess.isGameOver()) return null

  const legalMoves = chess.moves()
  if (legalMoves.length < options.minLegalMoves) return null
  if (legalMoves.length > options.maxLegalMoves) return null

  return {
    id: crypto.randomUUID(),
    fen: chess.fen(),
    pgn: chess.pgn(),
    turn: chess.turn() === 'w' ? 'white' : 'black',
    legalMoves: legalMoves.sort(),
    legalMoveCount: legalMoves.length,
    moveNumber: Math.floor(chess.history().length / 2) + 1,
  }
}

/**
 * Generate multiple unique test positions
 */
export const generateTestPositions = (options: Partial<GeneratePositionsOptions> = {}): TestPosition[] => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const positions: TestPosition[] = []
  const seenFens = new Set<string>()

  let attempts = 0
  const maxAttempts = opts.count * 100

  while (positions.length < opts.count && attempts < maxAttempts) {
    attempts++
    const position = generateRandomPosition(opts)

    if (position && !seenFens.has(position.fen)) {
      seenFens.add(position.fen)
      positions.push(position)
    }
  }

  return positions
}

/**
 * Calculate benchmark score for a single position
 * Uses F1-style scoring: harmonic mean of recall and precision
 * - Recall: what % of legal moves did you find
 * - Precision: what % of your answers were correct
 */
const calculateScore = (
  legalMoves: string[],
  modelMoves: string[],
): {
  correct: string[]
  illegal: string[]
  missed: string[]
  accuracy: number
  penalty: number
  finalScore: number
} => {
  const legalSet = new Set(legalMoves)
  const modelSet = new Set(modelMoves)

  const correct = modelMoves.filter((m) => legalSet.has(m))
  const illegal = modelMoves.filter((m) => !legalSet.has(m))
  const missed = legalMoves.filter((m) => !modelSet.has(m))

  // Recall: how many legal moves did you find
  const recall = legalMoves.length > 0 ? (correct.length / legalMoves.length) * 100 : 0

  // Precision: how many of your answers were correct
  const precision = modelMoves.length > 0 ? (correct.length / modelMoves.length) * 100 : 0

  // F1 score: harmonic mean of precision and recall
  const finalScore = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  // Keep accuracy as recall for backwards compatibility, penalty as inverse of precision
  const accuracy = recall
  const penalty = 100 - precision

  return { correct, illegal, missed, accuracy, penalty, finalScore }
}

/**
 * Run benchmark for a single position
 */
const benchmarkPosition = async (
  position: TestPosition,
  provider: AiModelProvider,
  model: string,
  logger: Logger,
): Promise<ModelBenchmarkResult> => {
  const prompt = mustache.render(
    promptTemplate,
    {
      pgn: position.pgn,
      fen: position.fen,
      turn: position.turn.toUpperCase(),
    },
    {},
    { escape: (v: string) => v },
  )

  const startTime = Date.now()
  let rawResponse = ''
  let modelMoves: string[] = []
  let error: string | undefined

  try {
    const response = await makeBenchmarkPrompt({
      prompt,
      provider,
      model,
      logger,
    })

    rawResponse = response.rawResponse
    modelMoves = response.moves
    if (response.error) {
      error = response.error
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
    logger.error('Benchmark position failed', { error, positionId: position.id })
  }

  const responseTime = Date.now() - startTime
  const { correct, illegal, missed, accuracy, penalty, finalScore } = calculateScore(position.legalMoves, modelMoves)

  return {
    positionId: position.id,
    modelMoves,
    correctMoves: correct,
    illegalMoves: illegal,
    missedMoves: missed,
    accuracy,
    penalty,
    finalScore,
    responseTime,
    rawResponse,
    error,
  }
}

/**
 * Run full benchmark for a model using provided positions
 */
export const runLegalMoveBenchmark = async (
  positions: TestPosition[],
  provider: AiModelProvider,
  model: string,
  logger: Logger,
  onProgress?: (completed: number, total: number) => void,
): Promise<LegalMoveBenchmarkRun> => {
  const runId = crypto.randomUUID()

  logger.info('Starting legal move benchmark', {
    runId,
    provider,
    model,
    positionCount: positions.length,
  })

  const run: LegalMoveBenchmarkRun = {
    id: runId,
    createdAt: Date.now(),
    status: 'running',
    provider,
    model,
    positionCount: positions.length,
    positions,
    results: [],
  }

  const cfg = getBenchmarkConfig()
  const positionConcurrency = cfg.itemConcurrency
  let completed = 0

  run.results = await mapWithConcurrency(
    positions,
    positionConcurrency,
    async (position) => benchmarkPosition(position, provider, model, logger),
    () => {
      completed++
      onProgress?.(completed, positions.length)
      if (completed === positions.length || completed % 5 === 0) {
        logger.info('Legal move benchmark progress', { runId, provider, model, completed, total: positions.length })
      }
    },
  )

  // Calculate aggregate scores
  const completedResults = run.results.filter((r) => !r.error)
  if (completedResults.length > 0) {
    run.averageAccuracy = completedResults.reduce((sum, r) => sum + r.accuracy, 0) / completedResults.length
    run.averagePenalty = completedResults.reduce((sum, r) => sum + r.penalty, 0) / completedResults.length
    run.averageFinalScore = completedResults.reduce((sum, r) => sum + r.finalScore, 0) / completedResults.length
    run.totalCorrectMoves = completedResults.reduce((sum, r) => sum + r.correctMoves.length, 0)
    run.totalIllegalMoves = completedResults.reduce((sum, r) => sum + r.illegalMoves.length, 0)
    run.totalMissedMoves = completedResults.reduce((sum, r) => sum + r.missedMoves.length, 0)
  }

  run.completedAt = Date.now()
  run.status = completedResults.length > 0 ? 'completed' : 'failed'

  logger.info('Legal move benchmark completed', {
    runId,
    averageScore: run.averageFinalScore,
    totalCorrect: run.totalCorrectMoves,
    totalIllegal: run.totalIllegalMoves,
  })

  return run
}
