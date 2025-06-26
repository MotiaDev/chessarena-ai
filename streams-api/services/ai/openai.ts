import { OpenAI } from 'openai'
import z, { ZodObject, ZodRawShape } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { Handler } from './types'
import { Logger } from 'motia'

export const openai: Handler = async <T extends ZodRawShape>(
  prompt: string,
  zod: ZodObject<T>,
  logger: Logger,
): Promise<z.infer<typeof zod>> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'o4-mini-2025-04-16',
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'chess_move', schema: zodToJsonSchema(zod) },
    },
  })

  logger.info('OpenAI response received')

  const content = JSON.parse(completion.choices[0].message.content ?? '{}')

  return content
}
