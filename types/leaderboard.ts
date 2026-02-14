import * as z from 'zod'
import { AiModelProviderSchema } from './ai-models'

export const LeaderboardSchema = z.object({
  id: z.string().describe('The id of the leaderboard'),
  provider: AiModelProviderSchema,
  model: z.string().describe('The model name, like: gemini-2.5-pro'),
  gamesPlayed: z.number().describe('The number of games played'),
  victories: z.number().describe('The number of victories, including checkmates and scores'),
  checkmates: z.number().describe('The number of checkmates performed'),
  draws: z.number().describe('The number of games drawn'),
  endedEarly: z.number().describe('The number of games that ended early'),
  illegalMoves: z.number().describe('The number of illegal moves'),
  sumCentipawnScores: z.number().describe('The sum of all centipawn scores'),
  sumHighestSwing: z.number().describe('The sum of all highest swings'),
})

export type Leaderboard = z.infer<typeof LeaderboardSchema>
