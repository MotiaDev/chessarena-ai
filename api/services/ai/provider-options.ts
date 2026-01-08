import { AiModelProvider } from '@chessarena/types/ai-models'
import type { JSONValue } from 'ai'

type OpenAIReasoningEffort = 'minimal' | 'low' | 'medium' | 'high'
type GrokReasoningEffort = 'low' | 'high'

const clampInt = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const parseOpenAiReasoningEffort = (value: string | undefined): OpenAIReasoningEffort | undefined => {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  if (normalized === 'minimal') return 'minimal'
  if (normalized === 'low') return 'low'
  if (normalized === 'medium') return 'medium'
  if (normalized === 'high') return 'high'
  return undefined
}

const parseGrokReasoningEffort = (value: string | undefined): GrokReasoningEffort | undefined => {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  if (normalized === 'low') return 'low'
  if (normalized === 'high') return 'high'
  return undefined
}

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
          // Gemini thinkingBudget is model-dependent; clamp to a safe max across the series.
          thinkingConfig: { thinkingBudget: 24576 },
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

/**
 * Benchmark-specific provider options.
 * Keeps results reproducible and avoids long tail timeouts by using a consistent,
 * capped reasoning budget across providers.
 */
export const getBenchmarkProviderOptions = (
  provider: AiModelProvider,
  model: string,
): Record<string, Record<string, JSONValue>> => {
  const openaiEffort = parseOpenAiReasoningEffort(process.env.BENCHMARK_OPENAI_REASONING_EFFORT) ?? 'low'

  switch (provider) {
    case 'openai': {
      if (!model.startsWith('gpt-5')) return {}
      return { openai: { reasoningEffort: openaiEffort } }
    }
    case 'claude':
    case 'gemini':
    case 'grok':
    default:
      return {}
  }
}
