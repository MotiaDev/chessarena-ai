import { AiModelProviderSchema } from '@chessarena/types/ai-models'
import { GameSchema, Player } from '@chessarena/types/game'
import { ApiRouteConfig, Handlers } from 'motia'
import { RefinementCtx, z } from 'zod'
import { supportedModelsByProvider } from '../../services/ai/models'
import { createGame } from '../../services/chess/create-game'
import { auth } from '../middlewares/auth.middleware'
import { UserState } from '../states/user-state'

const refine = (data: Player, ctx: RefinementCtx) => {
  if (data.ai && !data.model) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['model'],
      message: 'Model is required when AI is enabled',
    })
  }

  if (data.ai) {
    const isValidAiProvider = data.ai in supportedModelsByProvider
    const isValidModel = data.model && supportedModelsByProvider[data.ai]?.includes(data.model)

    if (!isValidAiProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ai'],
        message: 'Invalid AI provider',
      })
    }

    if (!isValidModel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['model'],
        message: 'Invalid AI model',
      })
    }
  }
}

const playerSchema = () => {
  return z
    .object({
      ai: AiModelProviderSchema().optional(),
      model: z.string().optional(),
    })
    .superRefine(refine)
}

const bodySchema = z.object({
  players: z.object({
    white: playerSchema(),
    black: playerSchema(),
  }),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'CreateGame',
  description: 'Create a new game',
  path: '/chess/create-game',
  method: 'POST',
  emits: ['chess-game-created'],
  virtualSubscribes: ['api:create-game'],
  flows: ['chess'],
  bodySchema,
  middleware: [auth({ required: true })],
  responseSchema: {
    200: GameSchema,
    400: z.object(
      { message: z.string(), errors: z.array(z.object({ message: z.string() })) },
      { description: 'Validation issue' },
    ),
    401: z.object({ message: z.string() }, { description: 'User is not found' }),
  },
}

export const handler: Handlers['CreateGame'] = async (req, { logger, emit, state, streams }) => {
  logger.info('[CreateGame] Received createGame event')

  const userState = new UserState(state)
  const user = await userState.getUser(req.tokenInfo.sub)
  const validationResult = bodySchema.safeParse(req.body)

  if (!user) {
    logger.error('[CreateGame] User not found', { userId: req.tokenInfo.sub })
    return { status: 401, body: { message: 'User not found' } }
  }

  if (!validationResult.success) {
    logger.error('[CreateGame] Invalid request body', { errors: validationResult.error.errors })
    return { status: 400, body: { message: 'Invalid request body', errors: validationResult.error.errors } }
  }

  const game = await createGame(req.body.players, streams, logger, user)

  logger.info('[CreateGame] Game created', { gameId: game.id })

  await emit({
    topic: 'chess-game-created',
    data: { gameId: game.id, fenBefore: game.fen },
  })

  return { status: 200, body: game }
}
