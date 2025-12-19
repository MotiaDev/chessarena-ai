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
  // From AI SDK docs: https://sdk.vercel.ai/providers/ai-sdk-providers/openai
  openai: [
    'gpt-5.2',                  // Latest
    'gpt-5.1',                  // Previous flagship
    'gpt-5',                    // GPT-5
    'gpt-5-mini',               // Fast
    'gpt-4.1',                  // GPT-4.1
    'gpt-4.1-mini',             // Fast GPT-4.1
    'gpt-4o',                   // GPT-4o
    'gpt-4o-mini',              // Fast GPT-4o
  ],
  // From AI SDK docs: https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai
  gemini: [
    'gemini-3-pro-preview',     // Latest preview
    'gemini-2.5-pro',           // Latest pro
    'gemini-2.5-flash',         // Fast
    'gemini-2.5-flash-lite',    // Ultra fast
    'gemini-2.0-flash',         // Stable flash
    'gemini-1.5-pro',           // Previous pro
    'gemini-1.5-flash',         // Previous flash
  ],
  // From AI SDK docs: https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic
  claude: [
    'claude-opus-4-5',          // Latest opus (no dot!)
    'claude-sonnet-4-5',        // Latest sonnet (no dot!)
    'claude-haiku-4-5',         // Latest haiku (no dot!)
    'claude-opus-4-0',          // Opus 4.0
    'claude-sonnet-4-0',        // Sonnet 4.0
    'claude-3-7-sonnet-latest', // Claude 3.7
    'claude-3-5-haiku-latest',  // Claude 3.5 Haiku
  ],
  // From AI SDK docs: https://sdk.vercel.ai/providers/ai-sdk-providers/xai
  grok: [
    'grok-4-fast-non-reasoning',
    'grok-4-fast-reasoning',
    'grok-4',
    'grok-3',
    'grok-3-fast',
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
