import { type PublicUser, publicUserSchema } from '@chessarena/types/user'
import { api, type Handlers, type StepConfig } from 'motia'
import { z } from 'zod'
import { UserState } from '../states/user-state'

export const config = {
  name: 'GetUser',
  description: 'Get user by ID',
  flows: ['auth'],
  triggers: [
    api('GET', '/user/:id', {
      responseSchema: {
        200: publicUserSchema,
        404: z.object({ message: z.string() }).strict(),
      },
    }),
  ],
  enqueues: [],
  virtualEnqueues: [],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (req, { logger, state }) => {
  logger.info('Received getUser event', { id: req.pathParams.id })

  const userState = new UserState(state)
  const user = await userState.getUser(req.pathParams.id)

  if (!user) {
    return { status: 404, body: { message: 'User not found' } }
  }

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    profilePic: user.profilePic,
  }

  logger.info('User found', { publicUser })

  return { status: 200, body: publicUser }
}
