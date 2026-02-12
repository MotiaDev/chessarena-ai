import { api, type Handlers, type StepConfig } from 'motia'
import { z } from 'zod'
import { auth } from '../../middlewares/auth.middleware'
import { UserState } from '../../states/user-state'

export const config = {
  name: 'AcceptRequestAccess',
  description: 'Accept access to a game',
  flows: ['chess'],
  triggers: [
    api('POST', '/request-access/:gameId/accept', {
      bodySchema: z.object({ userId: z.string() }).strict(),
      responseSchema: {
        200: z.object({}).strict(),
        404: z.object({ message: z.string() }).strict(),
        400: z.object({ message: z.string() }).strict(),
      },
      middleware: [auth({ required: true })],
    }),
  ],
  enqueues: [],
  virtualEnqueues: [],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (req, { logger, streams, state }) => {
  const gameId = req.pathParams.gameId

  logger.info('Received accept request access', { gameId, request: req.body })

  const userState = new UserState(state)
  const user = await userState.getUser(req.tokenInfo!.sub)
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
