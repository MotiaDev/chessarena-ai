import { z } from 'zod'

export const GameMessageSchema = z.object({
  id: z.string({ description: 'The ID of the message' }),
  message: z.string({ description: 'The message to be sent' }),
  sender: z.string({ description: 'The name of the sender' }),
  profilePic: z.string({ description: 'The profile picture of the sender' }).optional(),
  role: z.enum(['white', 'black', 'spectator', 'root'], { description: 'The role of the sender' }),
  timestamp: z.number({ description: 'The timestamp of the message' }),
  move: z
    .object({
      from: z.string({ description: 'The square to move from, example: e2, Make sure to move from a valid square' }),
      to: z.string({ description: 'The square to move to, example: e4. Make sure to move to a valid square' }),
      promotion: z.enum(['q', 'r', 'b', 'n'], { description: 'The promotion piece, if any' }).optional(),
    })
    .optional(),
  isIllegalMove: z.boolean({ description: 'Whether the move is illegal' }).optional(),
})

export type GameMessage = z.infer<typeof GameMessageSchema>
