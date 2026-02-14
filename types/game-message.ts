import * as z from 'zod'

export const GameMessageSchema = z.object({
  id: z.string().describe('The ID of the message'),
  message: z.string().describe('The message to be sent'),
  sender: z.string().describe('The name of the sender'),
  profilePic: z.string().describe('The profile picture of the sender').optional(),
  role: z.enum(['white', 'black', 'spectator', 'root']).describe('The role of the sender'),
  timestamp: z.number().describe('The timestamp of the message'),
  moveSan: z.string().describe('The move in Standard Algebraic Notation (SAN)').optional(),
  isIllegalMove: z.boolean().describe('Whether the move is illegal').optional(),
})

export type GameMessage = z.infer<typeof GameMessageSchema>
