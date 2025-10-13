import { streamObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { AiPlayerPromptSchema } from '@chessarena/types/ai-models'
import { models } from './models'
import { Handler } from './types'

export const gemini: Handler = async ({ prompt, logger, model, onThoughtUpdate }) => {
  const googleAI = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  })

  const { partialObjectStream, object } = streamObject({
    model: googleAI(model ?? models.gemini),
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
