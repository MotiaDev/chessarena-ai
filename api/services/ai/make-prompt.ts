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
  model: Models,
  logger: Logger,
): Promise<z.infer<typeof zod>> => {
  const handler = models[model]

  return handler(input, zod, logger)
}
