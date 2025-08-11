import { ZodObject, ZodRawShape } from 'zod'
import { openai } from './openai'
import { Handler } from './types'
import { Logger } from 'motia'
import { gemini } from './gemini'
import { claude } from './claude'
import { grok } from './grok'
import { AiModelProvider } from '@chessarena/types/ai-models'

const providers: Record<AiModelProvider, Handler> = {
  openai,
  gemini,
  claude,
  grok,
}

type MakePromptInput<T extends ZodRawShape> = {
  prompt: string
  zod: ZodObject<T>
  provider: AiModelProvider
  logger: Logger
  model: string
}

export const makePrompt = async <T extends ZodRawShape>(input: MakePromptInput<T>) => {
  const handler = providers[input.provider]

  return handler(input)
}
