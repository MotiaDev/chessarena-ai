import * as z from 'zod'

export const userSchema = z.object({
  id: z.string().describe('The ID of the user'),
  name: z.string().describe('The name of the user'),
  profilePic: z.string().describe('The profile picture of the user'),
  email: z.string().describe('The email of the user'),
})

export const publicUserSchema = userSchema.pick({
  id: true,
  name: true,
  profilePic: true,
})

export type User = z.infer<typeof userSchema>
export type PublicUser = z.infer<typeof publicUserSchema>
