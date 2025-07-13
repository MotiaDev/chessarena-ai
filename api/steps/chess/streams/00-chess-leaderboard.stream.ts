import { StreamConfig } from 'motia'
import { z } from 'zod'

const LeaderBoardSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'claude'], { description: 'The provider of the model' }),
  model: z.string({ description: 'The model name, like: gemini-2.5-pro' }),
  gamesPlayed: z.number({ description: 'The number of games played' }),
  wins: z.number({ description: 'The number of games won' }),
  draws: z.number({ description: 'The number of games drawn' }),
  illegalMoves: z.number({ description: 'The number of illegal moves' }),
  sumCentipawnScores: z.number({ description: 'The sum of all centipawn scores' }),
  sumHighestSwing: z.number({ description: 'The sum of all highest swings' }),
})

export const config: StreamConfig = {
  name: 'chessLeaderboard',
  schema: LeaderBoardSchema,
  baseConfig: { storageType: 'default' },
}

export type Leaderboard = z.infer<typeof LeaderBoardSchema>
