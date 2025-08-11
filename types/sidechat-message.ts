import { z } from 'zod'

export const SidechatMessageSchema = z.object({
  message: z.string({ description: 'The message to be sent' }),
  sender: z.string({ description: 'The name of the sender' }),
  role: z.enum(['white', 'black', 'spectator', 'root'], { description: 'The role of the sender' }),
  timestamp: z.number({ description: 'The timestamp of the message' }),
})

export type SidechatMessage = z.infer<typeof SidechatMessageSchema>
