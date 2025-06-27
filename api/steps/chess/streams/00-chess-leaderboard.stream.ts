import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'chessLeaderboard',
  schema: z.object({
    provider: z.enum(['openai', 'gemini', 'claude'], { description: 'The provider of the model' }),
    model: z.string({ description: 'The model name, like: gemini-2.5-pro' }),
    gamesPlayed: z.number({ description: 'The number of games played' }),
    wins: z.number({ description: 'The number of games won' }),
  }),
  baseConfig: { storageType: 'default' },
}
