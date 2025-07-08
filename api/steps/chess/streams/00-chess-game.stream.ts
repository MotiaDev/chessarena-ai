import { StreamConfig } from 'motia'
import { z } from 'zod'

const PlayerScore = z.object({
  averageEvaluation: z.number({ description: 'The average evaluation of the game' }),
  evaluationSwings: z.number({ description: 'The evaluation swings of the game' }),
  finalPositionEvaluation: z.number({ description: 'The final position evaluation of the game' }),
  overallTrend: z.number({ description: 'The overall trend of the game' }),
})

const Scoreboard = z.object({
  white: z.object({
    name: z.string({ description: 'The name of the player' }),
    score: z.number({ description: 'The score of the player' }),
    averageEval: z.number({ description: 'The average evaluation of the player' }),
    avgSwing: z.number({ description: 'The average swing of the player' }),
    finalEval: z.number({ description: 'The final evaluation of the player' }),
    trend: z.string({ description: 'The trend of the player' }),
  }),
  black: z.object({
    name: z.string({ description: 'The name of the player' }),
    score: z.number({ description: 'The score of the player' }),
    averageEval: z.number({ description: 'The average evaluation of the player' }),
    avgSwing: z.number({ description: 'The average swing of the player' }),
    finalEval: z.number({ description: 'The final evaluation of the player' }),
    trend: z.string({ description: 'The trend of the player' }),
  }),
  gameStatus: z.string({ description: 'The status of the game' }),
  totalMoves: z.number({ description: 'The total number of moves' }),
  decisiveMoment: z.object({
    moveNumber: z.number({ description: 'The move number' }),
    evalChange: z.number({ description: 'The evaluation change' }),
    fen: z.string({ description: 'The FEN of the game' }),
  }).optional(),
})


export const gameSchema = z.object({
  id: z.string({ description: 'The ID of the game' }),
  fen: z.string({ description: 'The FEN of the game' }),
  turn: z.enum(['white', 'black'], { description: 'The color of the current turn' }),
  status: z.enum(['pending', 'completed', 'draw'], { description: 'The status of the game' }),
  lastMove: z.array(z.string({ description: 'The last move made' })).optional(),
  winner: z.enum(['white', 'black']).optional(),
  turns: z.number({ description: 'The number of turns' }).optional(),
  endGameReason: z.string({ description: 'The reason the game ended' }).optional(),
  players: z.object({
    white: z.object({
      name: z.string({ description: 'The name of the player' }),
      ai: z.enum(['openai', 'gemini', 'claude']).optional(),
      illegalMoveAttempts: z.number({ description: 'The number of illegal move attempts' }).optional(),
      totalMoves: z.number({ description: 'The total number of moves' }).optional(),
      captures: z.array(z.object({
        piece: z.string({ description: 'The piece captured' }),
        score: z.number({ description: 'The score of the capture' }),
      })).optional(),
      promotions: z.number({ description: 'The number of pawn promotions' }).optional(),
      score: PlayerScore.extend({}).optional(),
    }),
    black: z.object({
      name: z.string({ description: 'The name of the player' }),
      ai: z.enum(['openai', 'gemini', 'claude']).optional(),
      illegalMoveAttempts: z.number({ description: 'The number of illegal move attempts' }).optional(),
      totalMoves: z.number({ description: 'The total number of moves' }).optional(),
      captures: z.array(z.object({
        piece: z.string({ description: 'The piece captured' }),
        score: z.number({ description: 'The score of the capture' }),
      })).optional(),
      promotions: z.number({ description: 'The number of pawn promotions' }).optional(),
      score: PlayerScore.extend({}).optional(),
    }),
  }),
  check: z.boolean({ description: 'Whether the game is in check' }),
  scoreboard: Scoreboard.extend({}).optional(),
})

export type Game = z.infer<typeof gameSchema>

export const config: StreamConfig = {
  name: 'chessGame',
  schema: gameSchema,
  baseConfig: { storageType: 'default' },
}


export type PlayerScore = z.infer<typeof PlayerScore>

export type Scoreboard = z.infer<typeof Scoreboard>