import { StreamConfig } from 'motia'
import { z } from 'zod'

const playerScore = () =>
  z.object({
    averageSwing: z.number({ description: 'The average swing of the player' }),
    medianSwing: z.number({ description: 'The median swing of the player' }),
    highestSwing: z.number({ description: 'The highest swing of the player' }),
    highestCentipawnScore: z.number({ description: 'The highest centipawn score of the player' }),
    lowestCentipawnScore: z.number({ description: 'The lowest centipawn score of the player' }),
    averageCentipawnScore: z.number({ description: 'The average centipawn score of the player' }),
    medianCentipawnScore: z.number({ description: 'The median centipawn score of the player' }),
    finalCentipawnScore: z.number({ description: 'The final centipawn score of the player' }),
    blunders: z.number({ description: 'The number of blunders of the player' }),
  })

const Scoreboard = z.object({
  white: playerScore(),
  black: playerScore(),
  totalMoves: z.number({ description: 'The total number of moves' }),
  decisiveMoment: z
    .object({
      moveNumber: z.number({ description: 'The move number' }),
      evaluationSwing: z.number({ description: 'The evaluation swing' }),
      move: z.array(z.string({ description: 'The move that caused the decisive moment' })),
      fen: z.string({ description: 'The FEN of the game' }),
    })
    .optional(),
})

export const gameSchema = z.object({
  id: z.string({ description: 'The ID of the game' }),
  fen: z.string({ description: 'The FEN of the game' }),
  turn: z.enum(['white', 'black'], { description: 'The color of the current turn' }),
  status: z.enum(['pending', 'completed', 'draw', 'requires-retry'], { description: 'The status of the game' }),
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
      captures: z
        .array(
          z.object({
            piece: z.string({ description: 'The piece captured' }),
            score: z.number({ description: 'The score of the capture' }),
          }),
        )
        .optional(),
      promotions: z.number({ description: 'The number of pawn promotions' }).optional(),
      retryMoveAttempts: z.number({ description: 'The number of retry move attempts' }).optional(),
    }),
    black: z.object({
      name: z.string({ description: 'The name of the player' }),
      ai: z.enum(['openai', 'gemini', 'claude']).optional(),
      illegalMoveAttempts: z.number({ description: 'The number of illegal move attempts' }).optional(),
      totalMoves: z.number({ description: 'The total number of moves' }).optional(),
      captures: z
        .array(
          z.object({
            piece: z.string({ description: 'The piece captured' }),
            score: z.number({ description: 'The score of the capture' }),
          }),
        )
        .optional(),
      promotions: z.number({ description: 'The number of pawn promotions' }).optional(),
      retryMoveAttempts: z.number({ description: 'The number of retry move attempts' }).optional(),
    }),
  }),
  check: z.boolean({ description: 'Whether the game is in check' }),
  scoreboard: Scoreboard.optional(),
})

export type Game = z.infer<typeof gameSchema>

export const config: StreamConfig = {
  name: 'chessGame',
  schema: gameSchema,
  baseConfig: { storageType: 'default' },
}

export type PlayerScore = z.infer<ReturnType<typeof playerScore>>
export type Scoreboard = z.infer<typeof Scoreboard>
