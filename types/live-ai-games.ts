import { z } from 'zod'
import { AiModelProviderSchema } from './ai-models'

const AiPlayerSchema = () =>
  z.object({
    provider: AiModelProviderSchema(),
    model: z.string({ description: 'The model of the AI player' }),
  })

export const LiveAiGamesSchema = z.object({
  id: z.string({ description: 'The ID of the live AI game, should be openai-vs-gemini' }),
  gameId: z.string({ description: 'The ID of the game' }),
  players: z.object({ white: AiPlayerSchema(), black: AiPlayerSchema() }),
  createdAt: z.string({ description: 'The timestamp of the game' }),
})

export type LiveAiGames = z.infer<typeof LiveAiGamesSchema>
export type LiveAiPlayer = z.infer<ReturnType<typeof AiPlayerSchema>>
