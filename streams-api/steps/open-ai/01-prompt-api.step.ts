import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

const inputSchema = z.object({
  message: z.string({ description: 'The message to send to OpenAI' }),
  threadId: z.string({ description: 'The thread ID' }).optional(),
})
const responseSchema = z.object({
  threadId: z.string({ description: 'The thread ID' }),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'OpenAiApi',
  description: 'Call OpenAI',
  path: '/open-ai',
  method: 'POST',
  emits: ['openai-prompt'],
  flows: ['open-ai'],
  bodySchema: inputSchema,
  responseSchema: { 200: responseSchema },
}

export const handler: Handlers['OpenAiApi'] = async (req, { logger, emit, streams }) => {
  logger.info('[Call OpenAI] Received callOpenAi event', { message: req.body.message })

  const { message, threadId = crypto.randomUUID() } = req.body
  const userMessageId = crypto.randomUUID()
  const assistantMessageId = crypto.randomUUID()

  await streams.message.set(threadId, userMessageId, { message, from: 'user', status: 'created' })
  await streams.message.set(threadId, assistantMessageId, { message: '', from: 'assistant', status: 'created' })

  await emit({ topic: 'openai-prompt', data: { message, threadId, assistantMessageId } })

  return {
    status: 200,
    body: { threadId },
  }
}
