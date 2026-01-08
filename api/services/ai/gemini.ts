import { streamObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { AiPlayerPromptSchema } from '@chessarena/types/ai-models'
import { models } from './models'
import { getMaxReasoningProviderOptions } from './provider-options'
import { Handler } from './types'

export const gemini: Handler = async ({ prompt, logger, model, onThoughtUpdate }) => {
  const googleAI = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  })

  const modelId = model ?? models.gemini
  const { partialObjectStream, object } = streamObject({
    model: googleAI(modelId),
    prompt,
    schema: AiPlayerPromptSchema,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(180000),
    providerOptions: getMaxReasoningProviderOptions('gemini', modelId),
  })

  for await (const partialObject of partialObjectStream) {
    await onThoughtUpdate(partialObject.thought)
  }

  const completion = await object

  if (!completion.moveSan || !completion.thought) {
    logger.error('Invalid Gemini response received', { model, completion })
    return
  }

  logger.info('Gemini response received', { model, response: completion })
  return { ...completion, moveSan: completion.moveSan.trim() }
}
