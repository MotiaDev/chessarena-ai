import { ApiRouteConfig, Handlers } from 'motia'
import { supportedModelsByProvider } from '../../services/ai/models'
import { z } from 'zod'

const modelsSchema = z.object({
  openai: z.array(z.string()),
  gemini: z.array(z.string()),
  claude: z.array(z.string()),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'AvailableModels',
  description: 'Expose all available ai models for the supported providers (OpenAI, Google Gemini, Anthropic Claude)',
  path: '/chess/models',
  method: 'GET',
  emits: [],
  flows: ['chess'],
  bodySchema: z.object({}),
  responseSchema: {
    200: z.object({ models: modelsSchema }),
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
