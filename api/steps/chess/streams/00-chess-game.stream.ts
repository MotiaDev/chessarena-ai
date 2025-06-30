import { StreamConfig } from 'motia'
import { z } from 'zod'

export const gameSchema = z.object({
  id: z.string({ description: 'The ID of the game' }),
  fen: z.string({ description: 'The FEN of the game' }),
  turn: z.enum(['white', 'black'], { description: 'The color of the current turn' }),
  status: z.enum(['pending', 'completed', 'draw'], { description: 'The status of the game' }),
  lastMove: z.array(z.string({ description: 'The last move made' })).optional(),
  winner: z.enum(['white', 'black']).optional(),
  turns: z.number({ description: 'The number of turns' }).optional(),
  endGameReason: z.string({ description: 'The reason the game ended' }).optional(),
  players: z.object({
    white: z.object({
      name: z.string({ description: 'The name of the player' }),
      ai: z.enum(['openai', 'gemini', 'claude']).optional(),
      illegalMoveAttempts: z.number({ description: 'The number of illegal move attempts' }).optional(),
    }),
    black: z.object({
      name: z.string({ description: 'The name of the player' }),
      ai: z.enum(['openai', 'gemini', 'claude']).optional(),
      illegalMoveAttempts: z.number({ description: 'The number of illegal move attempts' }).optional(),
    }),
  }),
  check: z.boolean({ description: 'Whether the game is in check' }),
})

export type Game = z.infer<typeof gameSchema>

export const config: StreamConfig = {
  name: 'chessGame',
  schema: gameSchema,
  baseConfig: { storageType: 'default' },
}
