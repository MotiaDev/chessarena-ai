import { OpenAI } from 'openai'
import z, { ZodObject, ZodRawShape } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { Handler } from './types'
import { Logger } from 'motia'
import { models } from './models'

export const openai: Handler = async <T extends ZodRawShape>(
  prompt: string,
  zod: ZodObject<T>,
  logger: Logger,
  model?: string
): Promise<z.infer<typeof zod>> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const nextModel = model ?? models.openai

  const completion = await openai.chat.completions.create({
    model: nextModel,
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'chess_move', schema: zodToJsonSchema(zod) },
    },
  })

  logger.info('OpenAI response received', { model: nextModel })

  const content = JSON.parse(completion.choices[0].message.content ?? '{}')

  return content
}
