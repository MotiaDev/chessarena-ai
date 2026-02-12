import type { AiModelProvider } from '@chessarena/types/ai-models'
import { claude } from './claude'
import { gemini } from './gemini'
import { grok } from './grok'
import { openai } from './openai'
import type { Handler, PromptInput } from './types'

const providers: Record<AiModelProvider, Handler> = {
  openai,
  gemini,
  claude,
  grok,
}

export const makePrompt = (input: PromptInput) => {
  const handler = providers[input.provider]

  return handler(input)
}
