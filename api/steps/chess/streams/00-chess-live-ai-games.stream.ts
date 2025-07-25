import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'chessLiveAiGames',
  schema: z.object({
    id: z.string({ description: 'The ID of the live AI game, should be openai-vs-gemini' }),
    gameId: z.string({ description: 'The ID of the game' }),
    players: z.object({
      white: z.string({ description: 'The AI model of the white player, like: gemini-2.5-pro' }),
      black: z.string({ description: 'The AI model of the black player, like: gpt-4.5-preview-2025-02-27' }),
    }),
  }),
  baseConfig: { storageType: 'default' },
}
