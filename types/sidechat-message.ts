import * as z from 'zod'

export const SidechatMessageSchema = z.object({
  message: z.string().describe('The message to be sent'),
  sender: z.string().describe('The name of the sender'),
  role: z.enum(['white', 'black', 'spectator', 'root']).describe('The role of the sender'),
  timestamp: z.number().describe('The timestamp of the message'),
})

export type SidechatMessage = z.infer<typeof SidechatMessageSchema>
