import { z } from 'zod'

export const MoveEvaluationSchema = z.object({
  centipawnScore: z.number().describe('The evaluation in centipawns'),
  bestMove: z.string().describe('The best move'),
  evaluationSwing: z.number().describe('The evaluation swing, from -1000 to 1000'),
  blunder: z.boolean().describe('Whether the move is a blunder'),
})

export const GameMoveSchema = z.object({
  color: z.enum(['white', 'black']).describe('The color that made the move'),
  fenBefore: z.string().describe('The FEN of the game before the move'),
  fenAfter: z.string().describe('The FEN of the game after the move'),
  lastMove: z.array(z.string()).describe('The last move made, example ["c3", "c4"]'),
  check: z.boolean().describe('Whether the move is a check'),
  evaluation: MoveEvaluationSchema.optional(),
})

export type MoveEvaluation = z.infer<typeof MoveEvaluationSchema>
export type GameMove = z.infer<typeof GameMoveSchema>
