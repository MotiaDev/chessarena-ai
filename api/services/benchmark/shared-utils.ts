import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { AiModelProvider } from '@chessarena/types/ai-models'

/**
 * Check if timeout should be disabled for specific provider/model combinations.
 * Currently disabled for Grok models to avoid timeout issues with their API.
 */
export const shouldDisableTimeout = (provider: AiModelProvider, model: string): boolean => {
  if (provider !== 'grok') return false
  const enabled = (process.env.BENCHMARK_GROK_DISABLE_TIMEOUT ?? 'true') === 'true'
  if (!enabled) return false
  return model.startsWith('grok-3') || model.startsWith('grok-4')
}

/**
 * Create a provider model instance for the given provider and model name.
 */
export const createProviderModel = (provider: AiModelProvider, model: string) => {
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
      return openai(model)
    }
    case 'gemini': {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
      return google(model)
    }
    case 'claude': {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      return anthropic(model)
    }
    case 'grok': {
      const xai = createXai({ apiKey: process.env.XAI_API_KEY })
      return xai(model)
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Calculate F1 score for legal move benchmark results.
 * - Recall: what % of legal moves did the model find
 * - Precision: what % of model's answers were correct
 * - F1: harmonic mean of precision and recall
 */
export const calculateLegalMoveScore = (
  legalMoves: string[],
  modelMoves: string[],
): {
  correct: string[]
  illegal: string[]
  missed: string[]
  accuracy: number
  penalty: number
  finalScore: number
} => {
  const legalSet = new Set(legalMoves)
  const modelSet = new Set(modelMoves)

  const correct = modelMoves.filter((m) => legalSet.has(m))
  const illegal = modelMoves.filter((m) => !legalSet.has(m))
  const missed = legalMoves.filter((m) => !modelSet.has(m))

  // Recall: how many legal moves did you find
  const recall = legalMoves.length > 0 ? (correct.length / legalMoves.length) * 100 : 0

  // Precision: how many of your answers were correct
  const precision = modelMoves.length > 0 ? (correct.length / modelMoves.length) * 100 : 0

  // F1 score: harmonic mean of precision and recall
  const finalScore = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  // Keep accuracy as recall for backwards compatibility, penalty as inverse of precision
  const accuracy = recall
  const penalty = 100 - precision

  return { correct, illegal, missed, accuracy, penalty, finalScore }
}

/**
 * Get the environment variable name for a provider's API key.
 */
export const getApiKeyEnvVar = (provider: AiModelProvider): string => {
  const envVars: Record<AiModelProvider, string> = {
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    claude: 'ANTHROPIC_API_KEY',
    grok: 'XAI_API_KEY',
  }
  return envVars[provider]
}
