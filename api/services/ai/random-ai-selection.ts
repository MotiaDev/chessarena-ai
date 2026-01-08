import { AiModelProvider } from '@chessarena/types/ai-models'
import { supportedModelsByProvider } from './models'

type ModelWithWeight = {
  provider: AiModelProvider
  model: string
  weight: number // Higher weight = higher chance of selection
  tier: 'cheap' | 'mid' | 'expensive'
}

// Define model tiers and weights (cheaper = higher weight)
// IMPORTANT: Model names must match exactly with supportedModelsByProvider in models.ts
const MODEL_WEIGHTS: ModelWithWeight[] = [
  // Cheap tier (weight: 10) - highest chance
  { provider: 'gemini', model: 'gemini-2.5-flash-lite', weight: 10, tier: 'cheap' },
  { provider: 'gemini', model: 'gemini-2.5-flash', weight: 10, tier: 'cheap' },
  { provider: 'gemini', model: 'gemini-2.0-flash', weight: 10, tier: 'cheap' },
  { provider: 'claude', model: 'claude-3-5-haiku-latest', weight: 10, tier: 'cheap' },
  { provider: 'claude', model: 'claude-haiku-4-5', weight: 10, tier: 'cheap' },
  { provider: 'openai', model: 'gpt-4o-mini', weight: 10, tier: 'cheap' },
  { provider: 'openai', model: 'gpt-4.1-mini', weight: 10, tier: 'cheap' },
  { provider: 'grok', model: 'grok-3-fast', weight: 10, tier: 'cheap' },

  // Mid tier (weight: 5)
  { provider: 'gemini', model: 'gemini-2.5-pro', weight: 5, tier: 'mid' },
  { provider: 'claude', model: 'claude-sonnet-4-0', weight: 5, tier: 'mid' },
  { provider: 'claude', model: 'claude-3-7-sonnet-latest', weight: 5, tier: 'mid' },
  { provider: 'grok', model: 'grok-4-fast-non-reasoning', weight: 5, tier: 'mid' },
  { provider: 'openai', model: 'gpt-5-mini', weight: 5, tier: 'mid' },
  { provider: 'openai', model: 'gpt-4o', weight: 5, tier: 'mid' },
  { provider: 'openai', model: 'gpt-4.1', weight: 5, tier: 'mid' },

  // Expensive tier (weight: 2) - lowest chance
  { provider: 'gemini', model: 'gemini-3-pro-preview', weight: 2, tier: 'expensive' },
  { provider: 'claude', model: 'claude-sonnet-4-5', weight: 2, tier: 'expensive' },
  { provider: 'claude', model: 'claude-opus-4-0', weight: 2, tier: 'expensive' },
  { provider: 'claude', model: 'claude-opus-4-5', weight: 1, tier: 'expensive' },
  { provider: 'grok', model: 'grok-4-fast-reasoning', weight: 2, tier: 'expensive' },
  { provider: 'openai', model: 'gpt-5', weight: 2, tier: 'expensive' },
  { provider: 'openai', model: 'gpt-5.1', weight: 2, tier: 'expensive' },
  { provider: 'openai', model: 'gpt-5.2', weight: 1, tier: 'expensive' },
]

// Filter to only include models that are actually supported
const getAvailableModels = (): ModelWithWeight[] => {
  return MODEL_WEIGHTS.filter(({ provider, model }) => {
    const supported = supportedModelsByProvider[provider]
    return supported?.includes(model)
  })
}

/**
 * Select a random AI model with weighted probability
 * Cheaper models have higher chance of being selected
 */
export const selectRandomAI = (): { provider: AiModelProvider; model: string; tier: string } => {
  const availableModels = getAvailableModels()

  if (availableModels.length === 0) {
    // Fallback to first available model
    const provider = Object.keys(supportedModelsByProvider)[0] as AiModelProvider
    const model = supportedModelsByProvider[provider][0]
    return { provider, model, tier: 'unknown' }
  }

  // Calculate total weight
  const totalWeight = availableModels.reduce((sum, m) => sum + m.weight, 0)

  // Random selection based on weight
  let random = Math.random() * totalWeight
  for (const modelInfo of availableModels) {
    random -= modelInfo.weight
    if (random <= 0) {
      return {
        provider: modelInfo.provider,
        model: modelInfo.model,
        tier: modelInfo.tier,
      }
    }
  }

  // Fallback (shouldn't happen)
  const fallback = availableModels[0]
  return { provider: fallback.provider, model: fallback.model, tier: fallback.tier }
}

/**
 * Get all available models with their weights for display
 */
export const getAvailableModelsWithWeights = () => {
  return getAvailableModels().map(({ provider, model, weight, tier }) => ({
    provider,
    model,
    weight,
    tier,
    probability: (weight / getAvailableModels().reduce((sum, m) => sum + m.weight, 0)) * 100,
  }))
}
