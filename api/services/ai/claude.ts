import Anthropic from '@anthropic-ai/sdk'
import { Tool } from '@anthropic-ai/sdk/resources/messages'
import zodToJsonSchema from 'zod-to-json-schema'
import { models } from './models'
import { Handler } from './types'

export const claude: Handler = async ({ prompt, zod, logger, model }) => {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  logger.debug('Claude tool choice input schema', { schema: zodToJsonSchema(zod) })

  const response = await client.messages.create({
    model: model ?? models.claude,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    tools: [{ name: 'move_action', input_schema: zodToJsonSchema(zod) as Tool.InputSchema }],
    tool_choice: { name: 'move_action', type: 'tool' },
  })

  logger.info('Claude response received', { model })

  const toolUse = response.content.find((c) => c.type === 'tool_use')

  logger.debug('Claude tool used', { toolUse })

  return zod.parse(toolUse?.input)
}
