import { AiModelProvider } from '@chessarena/types/ai-models'
import type { JSONValue } from 'ai'

export const getMaxReasoningProviderOptions = (
  provider: AiModelProvider,
  model: string,
): Record<string, Record<string, JSONValue>> => {
  switch (provider) {
    case 'openai': {
      if (!model.startsWith('gpt-5')) return {}
      return { openai: { reasoningEffort: 'high' } }
    }
    case 'claude': {
      const supportsThinking = model.includes('-4-') || model.includes('-4')
      if (!supportsThinking) return {}
      return {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 16000 },
        },
      }
    }
    case 'gemini': {
      const supportsThinking = model.includes('gemini-2.5') || model.includes('gemini-3')
      if (!supportsThinking) return {}
      return {
        google: {
          thinkingConfig: { thinkingBudget: 32768 },
        },
      }
    }
    case 'grok': {
      // xAI only supports reasoningEffort on specific models (e.g. grok-3-mini).
      if (model === 'grok-3-mini') return { xai: { reasoningEffort: 'high' } }
      return {}
    }
    default:
      return {}
  }
}
