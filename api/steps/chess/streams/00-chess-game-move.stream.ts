import { StreamConfig } from 'motia'
import { z } from 'zod'

const GameMoveSchema = z.object({
  piece: z.string({ description: 'The piece moved' }),
  color: z.string({ description: 'The color of the piece moved' }),
  from: z.string({ description: 'The square to move from' }),
  to: z.string({ description: 'The square to move to' }),
  score: z.number({ description: 'The score of the move' }),
  captureScore: z.number({ description: 'The capture score of the move' }),
  isCheck: z.boolean({ description: 'Whether the move is a check' }),
  isCheckmate: z.boolean({ description: 'Whether the move is a checkmate' }),
  isCapture: z.boolean({ description: 'Whether the move is a capture' }),
  isPromotion: z.boolean({ description: 'Whether the move is a promotion' }),
  isCastling: z.boolean({ description: 'Whether the move is a castling' }),
  isEnPassant: z.boolean({ description: 'Whether the move is an en passant' }),
})

export const config: StreamConfig = {
  name: 'chessGameMove',
  schema: z.object({
    color: z.enum(['white', 'black'], { description: 'The color that made the move' }),
    fenBefore: z.string({ description: 'The FEN of the game before the move' }),
    fenAfter: z.string({ description: 'The FEN of the game after the move' }),
    lastMove: z.array(z.string(), { description: 'The last move made, example ["c3", "c4"]' }),
    check: z.boolean({ description: 'Whether the move is a check' }),
    move: GameMoveSchema,
  }),
  baseConfig: { storageType: 'default' },
}

export type GameMove = z.infer<typeof GameMoveSchema>