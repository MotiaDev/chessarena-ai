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

export const handler: Handlers['OpenAiApi'] = async (req, { traceId, logger, emit, streams }) => {
  logger.info('[Call OpenAI] Received callOpenAi event', { message: req.body.message })

  const { message, threadId = crypto.randomUUID() } = req.body
  const userMessageId = crypto.randomUUID()
  const newMessages: { id: string; from: string }[] = [
    { id: userMessageId, from: 'user' },
    { id: traceId, from: 'assistant' },
  ]
  const thread = await streams.thread.get(threadId)

  await streams.message.create(userMessageId, { message, status: 'created' })

  if (thread?.messages) {
    await streams.thread.update(threadId, { messages: [...thread.messages, ...newMessages] })
  } else {
    await streams.thread.create(threadId, { messages: newMessages })
  }

  await streams.message.create(traceId, { message: '', status: 'created' })
  await emit({ topic: 'openai-prompt', data: { message, threadId } })

  return {
    status: 200,
    body: { threadId },
  }
}
