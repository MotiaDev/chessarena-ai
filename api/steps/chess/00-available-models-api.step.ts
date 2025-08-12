import { AiModelsSchema } from '@chessarena/types/ai-models'
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { supportedModelsByProvider } from '../../services/ai/models'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'AvailableModels',
  description: 'Expose all available ai models for the supported providers (OpenAI, Google Gemini, Anthropic Claude)',
  path: '/chess/models',
  method: 'GET',
  emits: [],
  virtualEmits: [
    {
      topic: 'api:create-game',
      label: 'Used to create game',
    },
  ],
  flows: ['chess'],
  bodySchema: z.object({}),
  responseSchema: {
    200: z.object({ models: AiModelsSchema() }),
    404: z.object({ message: z.string() }),
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['AvailableModels'] = async (_, { logger }) => {
  logger.info('Received available models request')

  return {
    status: 200,
    body: {
      models: supportedModelsByProvider,
    },
  }
}
