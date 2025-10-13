import { streamObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { AiPlayerPromptSchema } from '@chessarena/types/ai-models'
import { models } from './models'
import { Handler } from './types'

export const claude: Handler = async ({ prompt, logger, model, onThoughtUpdate }) => {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const { partialObjectStream, object } = streamObject({
    model: anthropic(model ?? models.claude),
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
    logger.error('Invalid Claude response received', { model, completion })
    return
  }

  logger.info('Claude response received', { model, response: completion })
  return completion
}
