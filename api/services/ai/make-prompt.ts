import { AiModelProvider } from '@chessarena/types/ai-models'
import { openai } from './openai'
import { Handler, PromptInput } from './types'
import { gemini } from './gemini'
import { claude } from './claude'
import { grok } from './grok'

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
