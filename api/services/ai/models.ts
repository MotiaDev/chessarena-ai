import { AiModels, AiModelProvider, AiProviderDefaultModel } from '@chessarena/types/ai-models'

// NOTE: these are the models used for AI vs AI games, it is also used for backwards compatibility for existing games that don't have a model assigned to a player
export const models: AiProviderDefaultModel = {
  openai: 'gpt-5-2025-08-07',
  gemini: 'gemini-2.5-flash',
  claude: 'claude-sonnet-4-5-20250929',
  grok: 'grok-4-fast',
}

/**
 * ============================================
 * BENCHMARK MODELS - Add new models here!
 * ============================================
 * 
 * To add a new model for benchmarking:
 * 1. Add it to the appropriate provider array below
 * 2. Restart the dev server
 * 3. Run the benchmark: POST /benchmark/legal-moves/run-all
 * 
 * To run benchmark for a single model:
 * POST /benchmark/legal-moves/run { "provider": "claude", "model": "claude-3-5-haiku-20241022" }
 * 
 * Provider documentation:
 * - OpenAI: https://platform.openai.com/docs/models
 * - Gemini: https://ai.google.dev/gemini-api/docs/models
 * - Claude: https://docs.anthropic.com/en/docs/about-claude/models/overview
 * - Grok: https://docs.x.ai/docs/models
 */
export const supportedModelsByProvider: AiModels = {
  openai: [
    'gpt-5.2',
    'gpt-5.1-thinking',
    'gpt-5-2025-08-07',
    'gpt-5-mini-2025-08-07',
    'gpt-4.1-mini-2025-04-14',
    'gpt-3.5-turbo-instruct',
    'o4-mini-2025-04-16',
  ],
  gemini: [
    // Latest Gemini models
    'gemini-3.0-pro-preview',
    'gemini-3-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ],
  claude: [
    // Latest Claude models
    'claude-opus-4.5',
    'claude-opus-4-20250514',
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-20250514',
    'claude-3-7-sonnet-20250219',
    'claude-haiku-4-5-20251001',
    'claude-3-5-haiku-20241022',
  ],
  grok: [
    // Latest Grok models
    'grok-4-fast',
    'grok-4-fast-non-reasoning',
    'grok-3-mini',
    'grok-3',
  ],
}

/**
 * Helper to get all models as a flat array with provider info
 * Used by benchmarks
 */
export const getAllModels = (): { provider: AiModelProvider; model: string }[] => {
  const allModels: { provider: AiModelProvider; model: string }[] = []
  for (const [provider, models] of Object.entries(supportedModelsByProvider)) {
    for (const model of models) {
      allModels.push({ provider: provider as AiModelProvider, model })
    }
  }
  return allModels
}

/**
 * Get models for a specific provider
 */
export const getModelsForProvider = (provider: AiModelProvider): string[] => {
  return supportedModelsByProvider[provider] || []
}
