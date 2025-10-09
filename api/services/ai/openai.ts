import { createOpenAI, OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { models } from './models'
import { Handler } from './types'

export const openai: Handler = async ({ zod, model, logger, prompt }) => {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const { object: completion } = await generateObject({
    model: openai(model ?? models.openai),
    prompt,
    schema: zod,
    maxRetries: 2,
    abortSignal: AbortSignal.timeout(30000), // Force 30 second timeout
    providerOptions: {
      reasoningEffort: 'low',
    } satisfies OpenAIResponsesProviderOptions,
  })

  logger.info('OpenAI response received', { model })

  return completion
}
