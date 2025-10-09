import { createXai, XaiProviderOptions } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { models } from './models'
import { Handler } from './types'

export const grok: Handler = async ({ prompt, zod, logger, model }) => {
  const xai = createXai({
    apiKey: process.env.XAI_API_KEY,
  })

  const { object: completion } = await generateObject({
    model: xai(model ?? models.grok),
    prompt,
    schema: zod,
    providerOptions: {
      reasoningEffort: 'low',
    } satisfies XaiProviderOptions,
  })

  if (!completion.move || !completion.thought) {
    logger.error('Invalid Grok response received', { model, completion })
    return {} as any
  }

  logger.info('Grok response received', { model, response: completion })
  return completion
}
