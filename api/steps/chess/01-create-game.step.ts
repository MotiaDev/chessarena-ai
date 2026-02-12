import { AiModelProviderSchema } from '@chessarena/types/ai-models'
import { GameSchema, type Player } from '@chessarena/types/game'
import { api, type Handlers, type StepConfig } from 'motia'
import { type RefinementCtx, z } from 'zod'
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
      ai: AiModelProviderSchema.optional(),
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

export const config = {
  name: 'CreateGame',
  description: 'Create a new game',
  flows: ['chess'],
  triggers: [
    api('POST', '/chess/create-game', {
      bodySchema,
      responseSchema: {
        200: GameSchema,
        400: z.object(
          { message: z.string(), errors: z.array(z.object({ message: z.string() })) },
          { message: 'Validation issue' },
        ),
        401: z.object({ message: z.string() }, { message: 'User is not found' }),
      },
      middleware: [auth({ required: true })],
    }),
  ],
  enqueues: ['chess-game-created'],
  virtualEnqueues: [],
  virtualSubscribes: ['api:create-game'],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (req, { logger, enqueue, state, streams }) => {
  logger.info('[CreateGame] Received createGame event')

  const userState = new UserState(state)
  const user = await userState.getUser(req.tokenInfo.sub)
  const validationResult = bodySchema.safeParse(req.body)

  if (!user) {
    logger.error('[CreateGame] User not found', { userId: req.tokenInfo.sub })
    return { status: 401, body: { message: 'User not found' } }
  }

  if (!validationResult.success) {
    logger.error('[CreateGame] Invalid request body', { errors: z.treeifyError(validationResult.error) })
    return { status: 400, body: { message: 'Invalid request body', errors: z.treeifyError(validationResult.error) } }
  }

  const game = await createGame(req.body.players, streams, user)

  logger.info('[CreateGame] Game created', { gameId: game.id })

  await enqueue({ topic: 'chess-game-created', data: { gameId: game.id, fenBefore: game.fen } })

  return { status: 200, body: game }
}
