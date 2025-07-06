import { StreamConfig } from 'motia'
import { z } from 'zod'

const GameEvaluationSchema = z.object({
  evaluation: z.number(),
  color: z.string({description: 'The color of the pieces that the player played, white or black'}),
  timestamp: z.number({description: 'The timestamp of the evaluation'}),
});

const PlayerAnalysisSchema = z.object({
  strength: z.number(),
  consistency: z.number(),
  trend: z.number(),
  reliability: z.number(),
  gamesAnalyzed: z.number(),
  whiteGames: z.number(),
  blackGames: z.number(),
});

export const config: StreamConfig = {
  name: 'chessLeaderboard',
  schema: z.object({
    provider: z.enum(['openai', 'gemini', 'claude'], { description: 'The provider of the model' }),
    model: z.string({ description: 'The model name, like: gemini-2.5-pro' }),
    gamesPlayed: z.number({ description: 'The number of games played' }),
    wins: z.number({ description: 'The number of games won' }),
    draws: z.number({ description: 'The number of games drawn' }),
    illegalMoves: z.number({ description: 'The number of illegal moves' }),
    averageEvals: z.array(GameEvaluationSchema, { description: 'The average evaluation of each played game' }),
    analysis: PlayerAnalysisSchema.optional(),
  }),
  baseConfig: { storageType: 'default' },
}


export type GameEvaluation = z.infer<typeof GameEvaluationSchema>
export type PlayerAnalysis = z.infer<typeof PlayerAnalysisSchema>