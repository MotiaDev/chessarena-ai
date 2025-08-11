import { z } from 'zod'

export const moveEvaluationSchema = () =>
  z.object({
    centipawnScore: z.number({ description: 'The evaluation in centipawns' }),
    bestMove: z.string(),
    evaluationSwing: z.number({ description: 'The evaluation swing, from -1000 to 1000' }),
    blunder: z.boolean({ description: 'Whether the move is a blunder' }),
  })

export const MoveEvaluationSchema = moveEvaluationSchema()

export const GameMoveSchema = z.object({
  color: z.enum(['white', 'black'], { description: 'The color that made the move' }),
  fenBefore: z.string({ description: 'The FEN of the game before the move' }),
  fenAfter: z.string({ description: 'The FEN of the game after the move' }),
  lastMove: z.array(z.string(), { description: 'The last move made, example ["c3", "c4"]' }),
  check: z.boolean({ description: 'Whether the move is a check' }),
  evaluation: moveEvaluationSchema().optional(),
})

export type MoveEvaluation = z.infer<typeof MoveEvaluationSchema>
export type GameMove = z.infer<typeof GameMoveSchema>
