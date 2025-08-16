import { PublicUser, publicUserSchema } from '@chessarena/types/user'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { UserState } from '../states/user-state'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetUser',
  description: 'Get user by ID',
  path: '/user/:id',
  method: 'GET',
  emits: [],
  flows: ['auth'],

  responseSchema: {
    200: publicUserSchema,
    404: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['GetUser'] = async (req, { logger, state }) => {
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
