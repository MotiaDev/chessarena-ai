import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { Chess } from 'chess.js'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { TestPosition, ModelBenchmarkResult, LegalMoveBenchmarkRun } from '@chessarena/types/legal-move-benchmark'
import { makeBenchmarkPrompt } from './benchmark-prompt'

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

  const accuracy = legalMoves.length > 0 ? (correct.length / legalMoves.length) * 100 : 0
  const penalty = illegal.length * 5
  const finalScore = Math.max(0, accuracy - penalty)

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
 * Run full benchmark for a model
 */
export const runLegalMoveBenchmark = async (
  provider: AiModelProvider,
  model: string,
  logger: Logger,
  positionCount: number = 20,
  onProgress?: (completed: number, total: number) => void,
): Promise<LegalMoveBenchmarkRun> => {
  const runId = crypto.randomUUID()
  const positions = generateTestPositions({ count: positionCount })

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

  // Run benchmark for each position sequentially
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]
    logger.info('Benchmarking position', { runId, positionIndex: i + 1, total: positions.length })

    const result = await benchmarkPosition(position, provider, model, logger)
    run.results.push(result)

    if (onProgress) {
      onProgress(i + 1, positions.length)
    }

    // Small delay between requests to avoid rate limiting
    if (i < positions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

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
  run.status = 'completed'

  logger.info('Legal move benchmark completed', {
    runId,
    averageScore: run.averageFinalScore,
    totalCorrect: run.totalCorrectMoves,
    totalIllegal: run.totalIllegalMoves,
  })

  return run
}
