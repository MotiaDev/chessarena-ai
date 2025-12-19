import { AiPlayerPromptSchema } from '@chessarena/types/ai-models'
import { createOpenAI } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { models } from './models'
import { getMaxReasoningProviderOptions } from './provider-options'
import { Handler } from './types'

export const openai: Handler = async ({ model, logger, prompt, onThoughtUpdate }) => {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const modelId = model ?? models.openai
  const { partialObjectStream, object } = streamObject({
    model: openai(modelId),
    prompt,
    schema: AiPlayerPromptSchema,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(180000),
    providerOptions: getMaxReasoningProviderOptions('openai', modelId),
  })

  for await (const partialObject of partialObjectStream) {
    await onThoughtUpdate(partialObject.thought)
  }

  const completion = await object

  if (!completion.moveSan || !completion.thought) {
    logger.error('Invalid OpenAI response received', { model, completion })
    return
  }

  logger.info('OpenAI response received', { model, response: completion })
  return { ...completion, moveSan: completion.moveSan.trim() }
}
