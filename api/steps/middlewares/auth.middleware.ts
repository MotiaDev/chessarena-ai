import jwt from 'jsonwebtoken'
import { ApiMiddleware, ApiResponse } from 'motia'
import { TokenData } from '../../types-api'

export const auth = ({ required }: { required: boolean }): ApiMiddleware => {
  const authMiddleware: ApiMiddleware = async (req, ctx, next): Promise<ApiResponse<number, unknown>> => {
    ctx.logger.info('Validating bearer token middleware')

    const authToken = (req.headers['authorization'] ?? req.headers['Authorization']) as string

    if (!authToken && required) {
      ctx.logger.error('No authorization header found in request')

      return {
        status: 401,
        body: { error: 'Unauthorized' },
      }
    } else if (!authToken && !required) {
      ctx.logger.info('No authorization header found in request, but not required')
      return next()
    }

    ctx.logger.info('Authorization header found in request')

    const [, token] = authToken.split(' ')
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      req.tokenInfo = decoded as TokenData

      ctx.logger.info('Bearer token successfully validated', { token: decoded })
      return next()
    } catch (err: any) {
      ctx.logger.error('Bearer token error', { err })

      if (err.name === 'TokenExpiredError') {
        return {
          status: 401,
          body: { error: 'Unauthorized' },
        }
      }
      return {
        status: 401,
        body: { error: 'Unauthorized' },
      }
    }
  }

  return authMiddleware
}
