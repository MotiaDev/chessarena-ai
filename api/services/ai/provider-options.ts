import { AiModelProvider } from '@chessarena/types/ai-models'
import type { JSONValue } from 'ai'

type ReasoningPreset = 'fast' | 'balanced' | 'max'

const getPreset = (): ReasoningPreset => {
  const raw = (process.env.AI_REASONING_PRESET ?? process.env.BENCHMARK_REASONING_PRESET ?? 'balanced').toLowerCase()
  if (raw === 'fast' || raw === 'balanced' || raw === 'max') return raw
  return 'balanced'
}

export const getMaxReasoningProviderOptions = (
  provider: AiModelProvider,
  model: string,
): Record<string, Record<string, JSONValue>> => {
  const preset = getPreset()

  switch (provider) {
    case 'openai': {
      if (!model.startsWith('gpt-5')) return {}
      const reasoningEffort = preset === 'max' ? 'high' : preset === 'balanced' ? 'medium' : 'low'
      return { openai: { reasoningEffort } }
    }
    case 'claude': {
      const supportsThinking = model.includes('-4-') || model.includes('-4')
      if (!supportsThinking) return {}
      const budgetTokens = preset === 'max' ? 12000 : preset === 'balanced' ? 8000 : 4000
      return {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens },
        },
      }
    }
    case 'gemini': {
      const supportsThinking = model.includes('gemini-2.5') || model.includes('gemini-3')
      if (!supportsThinking) return {}
      // Must be within provider range; some models reject >24576.
      const thinkingBudget = preset === 'max' ? 24576 : preset === 'balanced' ? 8192 : 4096
      return {
        google: {
          thinkingConfig: { thinkingBudget },
        },
      }
    }
    case 'grok': {
      // xAI only supports reasoningEffort on specific models (e.g. grok-3-mini).
      if (model === 'grok-3-mini') {
        const reasoningEffort = preset === 'max' ? 'high' : preset === 'balanced' ? 'medium' : 'low'
        return { xai: { reasoningEffort } }
      }
      return {}
    }
    default:
      return {}
  }
}
