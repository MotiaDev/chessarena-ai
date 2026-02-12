import * as z from 'zod'
import { AiModelProviderSchema } from './ai-models'

export const PlayerScoreSchema = z.object({
  averageSwing: z.number().describe('The average swing of the player'),
  highestSwing: z.number().describe('The highest swing of the player'),
  finalCentipawnScore: z.number().describe('The final centipawn score of the player'),
  blunders: z.number().describe('The number of blunders of the player'),
  illegalMoveAttempts: z.number().describe('The number of illegal move attempts of the player'),
  captures: z.array(
    z.object({
      piece: z.string().describe('The piece captured'),
      score: z.number().describe('The score of the capture'),
    }),
  ),
  promotions: z.number().describe('The number of pawn promotions of the player'),
  checks: z.number().describe('The number of checks of the player'),
})

export const ScoreboardSchema = z.object({
  white: PlayerScoreSchema,
  black: PlayerScoreSchema,
  totalMoves: z.number().describe('The total number of moves'),
  decisiveMoment: z
    .object({
      moveNumber: z.number().describe('The move number'),
      evaluationSwing: z.number().describe('The evaluation swing'),
      move: z.array(z.string().describe('The move that caused the decisive moment')),
      fen: z.string().describe('The FEN of the game'),
    })
    .optional(),
})

export const PlayerSchema = z.object({
  userId: z.string().describe('The ID of the user').optional(),
  ai: AiModelProviderSchema.optional(),
  model: z.string().optional(),
  illegalMoveAttempts: z.number().describe('The number of illegal move attempts').optional(),
  totalMoves: z.number().describe('The total number of moves').optional(),
  captures: z
    .array(
      z.object({
        piece: z.string().describe('The piece captured'),
        score: z.number().describe('The score of the capture'),
      }),
    )
    .optional(),
  promotions: z.number().describe('The number of pawn promotions').optional(),
})

export const GameSchema = z.object({
  id: z.string().describe('The ID of the game'),
  fen: z.string().describe('The FEN of the game'),
  turn: z.enum(['white', 'black']).describe('The color of the current turn'),
  status: z.enum(['pending', 'completed', 'draw', 'endedEarly']).describe('The status of the game'),
  lastMove: z.array(z.string().describe('The last move made')).optional(),
  lastMoveSan: z.string().describe('The last move made in Standard Algebraic Notation (SAN)').optional(),
  winner: z.enum(['white', 'black']).optional(),
  turns: z.number().describe('The number of turns').optional(),
  endGameReason: z.string().describe('The reason the game ended').optional(),
  players: z.object({ white: PlayerSchema, black: PlayerSchema }),
  check: z.boolean().describe('Whether the game is in check'),
  scoreboard: ScoreboardSchema.optional(),
})

export const roleSchema = z.enum(['white', 'black', 'spectator', 'root'])

export type Game = z.infer<typeof GameSchema>

export type Player = z.infer<typeof PlayerSchema>
export type PlayerScore = z.infer<typeof PlayerScoreSchema>
export type Scoreboard = z.infer<typeof ScoreboardSchema>
export type GameRole = z.infer<typeof roleSchema>
