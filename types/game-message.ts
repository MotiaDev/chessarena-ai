import { z } from 'zod'

export const GameMessageSchema = z.object({
  id: z.string({ description: 'The ID of the message' }),
  message: z.string({ description: 'The message to be sent' }),
  sender: z.string({ description: 'The name of the sender' }),
  profilePic: z.string({ description: 'The profile picture of the sender' }).optional(),
  role: z.enum(['white', 'black', 'spectator', 'root'], { description: 'The role of the sender' }),
  timestamp: z.number({ description: 'The timestamp of the message' }),
  moveSan: z.string({ description: 'The move in Standard Algebraic Notation (SAN)' }).optional(),
  isIllegalMove: z.boolean({ description: 'Whether the move is illegal' }).optional(),
})

export type GameMessage = z.infer<typeof GameMessageSchema>
