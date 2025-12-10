import { z } from 'zod'
import { GameSchema, ScoreboardSchema, BenchmarkVariantSchema } from './game'
import { GameMoveSchema } from './game-move'
import { GameMessageSchema } from './game-message'
import { AiModelProviderSchema } from './ai-models'

export const GameHistorySchema = z.object({
  id: z.string({ description: 'The ID of the game' }),
  
  // Game metadata
  startedAt: z.number({ description: 'Unix timestamp when game started' }),
  endedAt: z.number({ description: 'Unix timestamp when game ended' }),
  duration: z.number({ description: 'Game duration in milliseconds' }),
  
  // Players info
  whitePlayer: z.object({
    provider: AiModelProviderSchema().optional(),
    model: z.string().optional(),
    isHuman: z.boolean(),
  }),
  blackPlayer: z.object({
    provider: AiModelProviderSchema().optional(),
    model: z.string().optional(),
    isHuman: z.boolean(),
  }),
  
  // Game result
  status: z.enum(['completed', 'draw', 'endedEarly']),
  winner: z.enum(['white', 'black']).optional(),
  endGameReason: z.string().optional(),
  variant: BenchmarkVariantSchema.default('guided'),
  
  // Stats
  totalMoves: z.number({ description: 'Total number of moves in the game' }),
  whiteIllegalMoves: z.number({ description: 'Illegal move attempts by white' }),
  blackIllegalMoves: z.number({ description: 'Illegal move attempts by black' }),
  
  // Full game data
  finalFen: z.string({ description: 'Final board position FEN' }),
  moves: z.array(GameMoveSchema, { description: 'All moves in the game' }),
  messages: z.array(GameMessageSchema, { description: 'All AI messages/reasoning' }),
  scoreboard: ScoreboardSchema.optional(),
  
  // PGN for export
  pgn: z.string({ description: 'Game in PGN format' }).optional(),
})

export const GameHistoryFilterSchema = z.object({
  provider: AiModelProviderSchema().optional(),
  model: z.string().optional(),
  variant: BenchmarkVariantSchema.optional(),
  winner: z.enum(['white', 'black']).optional(),
  status: z.enum(['completed', 'draw', 'endedEarly']).optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
})

export type GameHistory = z.infer<typeof GameHistorySchema>
export type GameHistoryFilter = z.infer<typeof GameHistoryFilterSchema>
