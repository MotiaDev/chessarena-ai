import { streamObject } from 'ai'
import { createXai } from '@ai-sdk/xai'
import { AiPlayerPromptSchema } from '@chessarena/types/ai-models'
import { models } from './models'
import { getMaxReasoningProviderOptions } from './provider-options'
import { Handler } from './types'

export const grok: Handler = async ({ prompt, logger, model, onThoughtUpdate }) => {
  const xai = createXai({
    apiKey: process.env.XAI_API_KEY,
  })

  const modelId = model ?? models.grok
  const { partialObjectStream, object } = streamObject({
    model: xai(modelId),
    prompt,
    schema: AiPlayerPromptSchema,
    mode: 'json',
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(180000),
    providerOptions: getMaxReasoningProviderOptions('grok', modelId),
  })

  for await (const partialObject of partialObjectStream) {
    await onThoughtUpdate(partialObject.thought)
  }

  const completion = await object

  if (!completion.moveSan || !completion.thought) {
    logger.error('Invalid Grok response received', { model, completion })
    return
  }

  logger.info('Grok response received', { model, response: completion })
  return { ...completion, moveSan: completion.moveSan.trim() }
}
