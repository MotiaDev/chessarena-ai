import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'chessLiveAiGames',
  schema: z.object({
    id: z.string({ description: 'The ID of the live AI game, should be openai-vs-gemini' }),
    gameId: z.string({ description: 'The ID of the game' }),
    players: z.object({
      white: z.enum(['openai', 'gemini', 'claude']),
      black: z.enum(['openai', 'gemini', 'claude']),
    }),
  }),
  baseConfig: { storageType: 'default' },
}
