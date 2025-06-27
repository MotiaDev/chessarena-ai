import Anthropic from '@anthropic-ai/sdk'
import z, { ZodObject, ZodRawShape } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { Handler } from './types'
import { Logger } from 'motia'
import { Tool } from '@anthropic-ai/sdk/resources/messages'
import { models } from './models'

export const claude: Handler = async <T extends ZodRawShape>(
  prompt: string,
  zod: ZodObject<T>,
  logger: Logger,
): Promise<z.infer<typeof zod>> => {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const response = await client.messages.create({
    model: models.claude,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    tools: [{ name: 'move_action', input_schema: zodToJsonSchema(zod) as Tool.InputSchema }],
    tool_choice: { name: 'move_action', type: 'tool' },
  })

  logger.info('Claude response received')

  const toolUse = response.content.find((c) => c.type === 'tool_use')

  return zod.parse(toolUse?.input)
}
