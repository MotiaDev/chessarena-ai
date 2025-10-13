import { createXai, XaiProviderOptions } from '@ai-sdk/xai'
import { generateObject, streamObject } from 'ai'
import { models } from './models'
import { Handler } from './types'
import { AiPlayerPrompt, AiPlayerPromptSchema } from '@chessarena/types/ai-models'

export const grok: Handler = async ({ prompt, logger, model, onThoughtUpdate }) => {
  const xai = createXai({
    apiKey: process.env.XAI_API_KEY,
  })

  const { partialObjectStream, object } = streamObject({
    model: xai(model ?? models.grok),
    prompt,
    schema: AiPlayerPromptSchema,
    maxRetries: 0,
    maxOutputTokens: 300,
    abortSignal: AbortSignal.timeout(180000),
  })

  for await (const partialObject of partialObjectStream) {
    await onThoughtUpdate(partialObject.thought)
  }

  const completion = await object

  if (!completion.move || !completion.thought) {
    logger.error('Invalid Grok response received', { model, completion })
    return
  }

  logger.info('Grok response received', { model, response: completion })
  return completion
}
