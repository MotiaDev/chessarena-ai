import { AiModelsSchema } from '@chessarena/types/ai-models'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { auth } from '../../middlewares/auth.middleware'
import { UserState } from '../../states/user-state'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'AcceptRequestAccess',
  description: 'Accept access to a game',
  path: '/request-access/:gameId/accept',
  method: 'POST',
  emits: [],
  flows: ['chess'],
  middleware: [auth({ required: true })],
  bodySchema: z.object({ userId: z.string() }),
  responseSchema: {
    200: z.object({}),
    404: z.object({ message: z.string() }),
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['AcceptRequestAccess'] = async (req, { logger, streams, state }) => {
  const gameId = req.pathParams.gameId

  logger.info('Received accept request access', { gameId, request: req.body })

  const userState = new UserState(state)
  const user = await userState.getUser(req.tokenInfo.sub)
  const game = await streams.chessGame.get('game', gameId)

  if (!game) {
    logger.error('Game not found', { gameId })

    return {
      status: 404,
      body: { message: 'Game not found' },
    }
  }

  if (game.players.black.userId || game.players.black.ai) {
    logger.error('Game is already in progress', { gameId })

    return {
      status: 400,
      body: { message: 'Game is already in progress' },
    }
  }

  if (game.players.white.userId !== user?.id) {
    logger.error('You are not the owner of the game', { gameId, userId: user?.id })

    return {
      status: 400,
      body: { message: 'You are not the owner of the game' },
    }
  }

  await streams.chessGame.set('game', gameId, {
    ...game,
    players: {
      ...game.players,
      black: { ...game.players.black, userId: req.body.userId },
    },
  })

  await streams.chessGame.send(
    { groupId: 'game', id: gameId },
    { type: 'on-access-accepted', data: { userId: req.body.userId } },
  )

  return { status: 200, body: {} }
}
