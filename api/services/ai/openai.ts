import { AiPlayerPromptSchema } from '@chessarena/types/ai-models'
import { createOpenAI, OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { generateObject, streamObject } from 'ai'
import { models } from './models'
import { Handler } from './types'

export const openai: Handler = async ({ model, logger, prompt, onThoughtUpdate }) => {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const { partialObjectStream, object } = streamObject({
    model: openai(model ?? models.openai),
    prompt,
    schema: AiPlayerPromptSchema,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(180000),
  })

  for await (const partialObject of partialObjectStream) {
    await onThoughtUpdate(partialObject.thought)
  }

  const completion = await object

  if (!completion.move || !completion.thought) {
    logger.error('Invalid OpenAI response received', { model, completion })
    return
  }

  logger.info('OpenAI response received', { model, response: completion })
  return completion
}
