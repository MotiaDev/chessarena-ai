import { OpenAI } from 'openai'
import zodToJsonSchema from 'zod-to-json-schema'
import { models } from './models'
import { Handler } from './types'

export const openai: Handler = async ({ zod, model, logger, prompt }) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const completion = await openai.chat.completions.create({
    model: model ?? models.openai,
    messages: [{ role: 'user', content: prompt }],
    reasoning_effort: 'low',
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'chess_move', schema: zodToJsonSchema(zod) },
    },
  })

  logger.info('OpenAI response received', { model })

  const content = JSON.parse(completion.choices[0].message.content ?? '{}')

  return content
}
