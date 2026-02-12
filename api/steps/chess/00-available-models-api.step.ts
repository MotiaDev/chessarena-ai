import { AiModelsSchema } from '@chessarena/types/ai-models'
import { api, type Handlers, type StepConfig } from 'motia'
import { z } from 'zod'
import { supportedModelsByProvider } from '../../services/ai/models'

export const config = {
  name: 'AvailableModels',
  description: 'Expose all available ai models for the supported providers (OpenAI, Google Gemini, Anthropic Claude)',
  flows: ['chess'],
  triggers: [
    api('GET', '/chess/models', {
      bodySchema: z.object({}).strict(),
      responseSchema: {
        200: z.object({ models: AiModelsSchema }),
        404: z.object({ message: z.string() }).strict(),
        400: z.object({ message: z.string() }).strict(),
      },
    }),
  ],
  enqueues: [],
  virtualEnqueues: [{ topic: 'api:create-game', label: 'Used to create game' }],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (_, { logger }) => {
  logger.info('Received available models request')

  return {
    status: 200,
    body: {
      models: supportedModelsByProvider,
    },
  }
}
