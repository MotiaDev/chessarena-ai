import { User, userSchema } from '@chessarena/types/user'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { TokenData } from '../../types-api'
import { UserState } from '../states/user-state'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'Auth',
  description: 'Auth',
  path: '/auth',
  method: 'POST',
  virtualSubscribes: [],
  emits: [],
  flows: ['Auth'],
  bodySchema: z.object({
    authToken: z.string(),
  }),

  responseSchema: {
    200: z.object({
      accessToken: z.string(),
      user: userSchema,
    }),
    401: z.object({ error: z.string() }),
    500: z.object({ error: z.string() }),
  },
}

export const createAccessToken = (userId: string): string => {
  const tokenData: TokenData = { sub: userId }
  const accessToken = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION as never })

  return accessToken
}

export const handler: Handlers['Auth'] = async (req, { logger, state }) => {
  logger.info('Auth request received')

  try {
    const userState = new UserState(state)
    const authToken = req.body.authToken
    const url = process.env.SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, serviceRoleKey)
    const { data, error } = await supabase.auth.getUser(authToken)

    if (data.user) {
      const sub = data.user.id

      logger.info('User data', { data })

      const fullName = data.user.user_metadata.full_name ?? ''
      const profilePic = data.user.user_metadata.avatar_url ?? ''
      const email = data.user.email ?? ''
      const name = fullName || email.split('@')[0]

      logger.info('Auth request successful', { sub, name, profilePic })

      const user: User = { id: sub, name, profilePic, email }
      await userState.setUser(sub, user)

      logger.info('User found', { sub })
      const accessToken = createAccessToken(sub)

      return {
        status: 200,
        body: { accessToken, user },
      }
    }

    return {
      status: 401,
      body: { error: error?.message ?? 'Failed to authenticate' },
    }
  } catch (err: any) {
    console.error(err)
    logger.error('Auth request failed', { error: err, stack: err.stack })
    return {
      status: 500,
      body: { error: 'Failed to authenticate' },
    }
  }
}
