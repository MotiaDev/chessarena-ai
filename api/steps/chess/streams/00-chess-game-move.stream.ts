import { StreamConfig } from 'motia'
import { z } from 'zod'

export const moveEvaluationSchema = () =>
  z.object({
    evaluation: z.number(),
    evaluationCp: z.number(),
    isMate: z.boolean(),
    mateIn: z.number().nullable().optional(),
    bestMove: z.string().nullable().optional(),
    movePlayed: z.string().nullable().optional(),
    moveQuality: z.number(),
    moveAccuracy: z.number(),
  })

export const MoveEvaluationSchema = moveEvaluationSchema()

const GameMoveSchema = z.object({
  color: z.enum(['white', 'black'], { description: 'The color that made the move' }),
  fenBefore: z.string({ description: 'The FEN of the game before the move' }),
  fenAfter: z.string({ description: 'The FEN of the game after the move' }),
  lastMove: z.array(z.string(), { description: 'The last move made, example ["c3", "c4"]' }),
  check: z.boolean({ description: 'Whether the move is a check' }),
  evaluation: moveEvaluationSchema().optional(),
})

export const config: StreamConfig = {
  name: 'chessGameMove',
  schema: GameMoveSchema,
  baseConfig: { storageType: 'default' },
}

export type GameMove = z.infer<typeof GameMoveSchema>
