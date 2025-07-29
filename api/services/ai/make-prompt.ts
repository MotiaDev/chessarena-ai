import z, { ZodObject, ZodRawShape } from 'zod'
import { openai } from './openai'
import { Handler, Models } from './types'
import { Logger } from 'motia'
import { gemini } from './gemini'
import { claude } from './claude'

const models: Record<Models, Handler> = {
  openai,
  gemini,
  claude,
}

export const makePrompt = async <T extends ZodRawShape>(
  input: string,
  zod: ZodObject<T>,
  provider: Models,
  logger: Logger,
  model?: string,
): Promise<z.infer<typeof zod>> => {
  const handler = models[provider]

  return handler(input, zod, logger, model)
}
