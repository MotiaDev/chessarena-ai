import { AiModelProvider } from '@chessarena/types/ai-models'
import { Logger } from 'motia'

type Stream = JSONStream<z.infer<typeof zod>>

export type PromptInput = {
  prompt: string
  provider: AiModelProvider
  logger: Logger
  model: string
  onThoughtUpdate: (partialThought?: string) => Promise<void>
}

export type Handler = (input: PromptInput) => Promise<AiPlayerPrompt>
