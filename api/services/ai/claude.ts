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
  model?: string
): Promise<z.infer<typeof zod>> => {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const nextModel = model ?? models.claude

  logger.debug("Claude tool choice input schema", {schema: zodToJsonSchema(zod)})

  const response = await client.messages.create({
    model: nextModel,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    tools: [{ name: 'move_action', input_schema: zodToJsonSchema(zod) as Tool.InputSchema }],
    tool_choice: { name: 'move_action', type: 'tool' },
  })

  logger.info('Claude response received', { model: nextModel })

  const toolUse = response.content.find((c) => c.type === 'tool_use')

  logger.debug('Claude tool used', { toolUse })

  return zod.parse(toolUse?.input)
}
