import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  profilePic: z.string(),
  email: z.string(),
})

export const publicUserSchema = userSchema.pick({
  id: true,
  name: true,
  profilePic: true,
})

export type User = z.infer<typeof userSchema>
export type PublicUser = z.infer<typeof publicUserSchema>
