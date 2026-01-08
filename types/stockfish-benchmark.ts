import { z } from 'zod'
import { AiModelProviderSchema } from './ai-models'

export const StockfishGameMoveSchema = z.object({
  moveNumber: z.number(),
  player: z.enum(['white', 'black']),
  moveSan: z.string(),
  fen: z.string(),
  centipawnScore: z.number().optional(), // Evaluation after move
  bestMove: z.string().optional(), // What Stockfish thinks was best
  centipawnLoss: z.number().optional(), // Difference from best move
  isAiMove: z.boolean(), // true if AI made this move, false if Stockfish
  responseTime: z.number().optional(), // ms for AI moves
  error: z.string().optional(),
})

export const StockfishGameResultSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
  status: z.enum(['running', 'completed', 'failed']),

  // Model info
  provider: AiModelProviderSchema(),
  model: z.string(),

  // Game info
  aiColor: z.enum(['white', 'black']),
  stockfishLevel: z.number(), // 1-20
  result: z.enum(['ai_win', 'stockfish_win', 'draw', 'ai_illegal_move', 'timeout']).optional(),
  resultReason: z.string().optional(),

  // Moves
  moves: z.array(StockfishGameMoveSchema),
  totalMoves: z.number(),
  finalFen: z.string().optional(),
  pgn: z.string().optional(),

  // ACPL calculation (only for AI moves)
  aiMoveCount: z.number().optional(),
  totalCentipawnLoss: z.number().optional(),
  averageCentipawnLoss: z.number().optional(), // ACPL
  blunders: z.number().optional(), // moves with >100 centipawn loss
  mistakes: z.number().optional(), // moves with 50-100 centipawn loss
  inaccuracies: z.number().optional(), // moves with 25-50 centipawn loss
})

export const StockfishBenchmarkRunSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
  status: z.enum(['running', 'completed', 'failed']),

  provider: AiModelProviderSchema(),
  model: z.string(),
  stockfishLevel: z.number(),

  // Two games: one as white, one as black
  gameAsWhite: StockfishGameResultSchema.optional(),
  gameAsBlack: StockfishGameResultSchema.optional(),

  // Combined stats
  gamesPlayed: z.number(),
  wins: z.number(),
  losses: z.number(),
  draws: z.number(),
  overallAcpl: z.number().optional(), // Average ACPL across both games
})

export const StockfishBenchmarkSummarySchema = z.object({
  id: z.string(),
  provider: AiModelProviderSchema(),
  model: z.string(),
  runsCompleted: z.number(),
  averageAcpl: z.number(),
  bestAcpl: z.number(),
  wins: z.number(),
  losses: z.number(),
  draws: z.number(),
  lastRunAt: z.number(),
})

export type StockfishGameMove = z.infer<typeof StockfishGameMoveSchema>
export type StockfishGameResult = z.infer<typeof StockfishGameResultSchema>
export type StockfishBenchmarkRun = z.infer<typeof StockfishBenchmarkRunSchema>
export type StockfishBenchmarkSummary = z.infer<typeof StockfishBenchmarkSummarySchema>
