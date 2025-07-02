import { StreamConfig } from 'motia'
import { z } from 'zod'

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
    }),
  }),
  check: z.boolean({ description: 'Whether the game is in check' }),
  allMoves: z.array(z.object({
    move: z.object({
      from: z.string({ description: 'The square to move from' }),
      to: z.string({ description: 'The square to move to' }),
      piece: z.string({ description: 'The piece moved' }),
      color: z.string({ description: 'The color of the piece moved' }),
    }),
    score: z.number({ description: 'The score of the move' }),
    captureScore: z.number({ description: 'The capture score of the move' }).optional(),
    isCheck: z.boolean({ description: 'Whether the move is a check' }).optional(),
    isCheckmate: z.boolean({ description: 'Whether the move is a checkmate' }).optional(),
    isCapture: z.boolean({ description: 'Whether the move is a capture' }).optional(),
    isPromotion: z.boolean({ description: 'Whether the move is a promotion' }).optional(),
    isCastling: z.boolean({ description: 'Whether the move is a castling' }).optional(),
    isEnPassant: z.boolean({ description: 'Whether the move is an en passant' }).optional(),
  })).optional(),
})

export type Game = z.infer<typeof gameSchema>

export const config: StreamConfig = {
  name: 'chessGame',
  schema: gameSchema,
  baseConfig: { storageType: 'default' },
}
