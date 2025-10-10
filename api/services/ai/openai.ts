import { createOpenAI, OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { models } from './models'
import { Handler } from './types'

export const openai: Handler = async ({ zod, model, logger, prompt }) => {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const modelName = model ?? models.openai

  // Different timeouts for different model types
  // Reasoning models (o-series) need more time, GPT models are faster
  const timeout =
    modelName.startsWith('o3-') || modelName.startsWith('o4-') || modelName.startsWith('o1-') ? 60000 : 45000

  const { object: completion } = await generateObject({
    model: openai(modelName),
    prompt,
    schema: zod,
    maxRetries: 2,
    abortSignal: AbortSignal.timeout(timeout),
    providerOptions: {
      reasoningEffort: 'low',
    } satisfies OpenAIResponsesProviderOptions,
  })

  logger.info('OpenAI response received', { model: modelName, timeout })

  return completion
}
