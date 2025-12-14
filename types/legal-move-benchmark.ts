import { z } from 'zod'
import { AiModelProviderSchema } from './ai-models'

export const TestPositionSchema = z.object({
  id: z.string(),
  fen: z.string(),
  pgn: z.string(),
  turn: z.enum(['white', 'black']),
  legalMoves: z.array(z.string()),
  legalMoveCount: z.number(),
  moveNumber: z.number(),
})

export const ModelBenchmarkResultSchema = z.object({
  positionId: z.string(),
  modelMoves: z.array(z.string()),
  correctMoves: z.array(z.string()),
  illegalMoves: z.array(z.string()),
  missedMoves: z.array(z.string()),
  accuracy: z.number(), // percentage of legal moves found
  penalty: z.number(), // penalty for illegal moves
  finalScore: z.number(), // accuracy - penalty
  responseTime: z.number(), // ms
  rawResponse: z.string(), // raw model response for debugging
  error: z.string().optional(), // if model failed to respond
})

export const LegalMoveBenchmarkRunSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  
  // Model info
  provider: AiModelProviderSchema(),
  model: z.string(),
  
  // Test configuration
  positionCount: z.number(),
  positions: z.array(TestPositionSchema),
  
  // Results
  results: z.array(ModelBenchmarkResultSchema),
  
  // Aggregate scores
  averageAccuracy: z.number().optional(),
  averagePenalty: z.number().optional(),
  averageFinalScore: z.number().optional(),
  totalCorrectMoves: z.number().optional(),
  totalIllegalMoves: z.number().optional(),
  totalMissedMoves: z.number().optional(),
})

export const LegalMoveBenchmarkSummarySchema = z.object({
  id: z.string(),
  provider: AiModelProviderSchema(),
  model: z.string(),
  runsCompleted: z.number(),
  averageScore: z.number(),
  bestScore: z.number(),
  worstScore: z.number(),
  lastRunAt: z.number(),
})

export type TestPosition = z.infer<typeof TestPositionSchema>
export type ModelBenchmarkResult = z.infer<typeof ModelBenchmarkResultSchema>
export type LegalMoveBenchmarkRun = z.infer<typeof LegalMoveBenchmarkRunSchema>
export type LegalMoveBenchmarkSummary = z.infer<typeof LegalMoveBenchmarkSummarySchema>
