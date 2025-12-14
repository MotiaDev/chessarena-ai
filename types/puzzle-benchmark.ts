import { z } from 'zod'
import { AiModelProviderSchema } from './ai-models'

export const PuzzleThemeSchema = z.enum(['mateIn1', 'oneMove'])

export const LichessPuzzleSchema = z.object({
  id: z.string(),
  rating: z.number(),
  themes: z.array(z.string()),
  solution: z.array(z.string()), // UCI format moves
  initialPly: z.number(),
  pgn: z.string(),
  fen: z.string(), // Position where puzzle starts
  legalMoves: z.array(z.string()), // Legal moves in SAN format
  solutionSan: z.string(), // First solution move in SAN
})

export const PuzzleSetSchema = z.object({
  id: z.string(),
  theme: PuzzleThemeSchema,
  createdAt: z.number(),
  puzzles: z.array(LichessPuzzleSchema),
  count: z.number(),
})

export const PuzzleResultSchema = z.object({
  puzzleId: z.string(),
  modelMove: z.string().optional(), // What the model played
  correctMove: z.string(), // The correct solution
  isCorrect: z.boolean(),
  responseTime: z.number(),
  rawResponse: z.string(),
  error: z.string().optional(),
})

export const PuzzleBenchmarkRunSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),

  // Model info
  provider: AiModelProviderSchema(),
  model: z.string(),

  // Which puzzle set was used
  puzzleSetId: z.string(),
  theme: PuzzleThemeSchema,

  // Results
  results: z.array(PuzzleResultSchema),

  // Aggregate scores
  totalPuzzles: z.number(),
  correctCount: z.number().optional(),
  accuracy: z.number().optional(), // percentage
})

export const PuzzleBenchmarkSummarySchema = z.object({
  id: z.string(),
  provider: AiModelProviderSchema(),
  model: z.string(),
  mateIn1Accuracy: z.number().optional(),
  oneMoveAccuracy: z.number().optional(),
  overallAccuracy: z.number().optional(),
  runsCompleted: z.number(),
  lastRunAt: z.number(),
})

export type PuzzleTheme = z.infer<typeof PuzzleThemeSchema>
export type LichessPuzzle = z.infer<typeof LichessPuzzleSchema>
export type PuzzleSet = z.infer<typeof PuzzleSetSchema>
export type PuzzleResult = z.infer<typeof PuzzleResultSchema>
export type PuzzleBenchmarkRun = z.infer<typeof PuzzleBenchmarkRunSchema>
export type PuzzleBenchmarkSummary = z.infer<typeof PuzzleBenchmarkSummarySchema>
