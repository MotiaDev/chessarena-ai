import { createXai } from '@ai-sdk/xai'
import { JSONSchema7 } from 'json-schema'
import zodToJsonSchema from 'zod-to-json-schema'
import { models } from './models'
import { Handler } from './types'

export const grok: Handler = async ({ prompt, zod, logger, model }) => {
  const xai = createXai({ apiKey: process.env.XAI_API_KEY })

  const completion = await xai.chat(model ?? models.grok).doGenerate({
    prompt: [{ role: 'system', content: prompt }],
    responseFormat: {
      type: 'json',
      schema: zodToJsonSchema(zod) as JSONSchema7,
    },
  })

  if (completion.content[0].type === 'text') {
    const response = JSON.parse(completion.content[0].text)
    logger.info('Grok response received', { model, response })
    return response
  }

  logger.error('Invalid Grok response received', { model, completion })

  return {} as any
}
