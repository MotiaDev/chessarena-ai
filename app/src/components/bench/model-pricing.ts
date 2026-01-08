// Model pricing data (USD per 1M tokens)
// These are mock prices - update with real pricing data

export type ModelPricing = {
  id: string
  provider: string
  model: string
  inputPrice: number  // USD per 1M input tokens
  outputPrice: number // USD per 1M output tokens
  avgPrice: number    // Average (input + output) / 2 for simple comparisons
}

export const modelPricing: ModelPricing[] = [
  // OpenAI - https://openai.com/api/pricing/
  { id: 'openai:gpt-5.2', provider: 'openai', model: 'gpt-5.2', inputPrice: 15.00, outputPrice: 60.00, avgPrice: 37.50 },
  { id: 'openai:gpt-5.1', provider: 'openai', model: 'gpt-5.1', inputPrice: 12.00, outputPrice: 48.00, avgPrice: 30.00 },
  { id: 'openai:gpt-5', provider: 'openai', model: 'gpt-5', inputPrice: 10.00, outputPrice: 40.00, avgPrice: 25.00 },
  { id: 'openai:gpt-5-mini', provider: 'openai', model: 'gpt-5-mini', inputPrice: 1.50, outputPrice: 6.00, avgPrice: 3.75 },
  { id: 'openai:gpt-4.1', provider: 'openai', model: 'gpt-4.1', inputPrice: 2.00, outputPrice: 8.00, avgPrice: 5.00 },
  { id: 'openai:gpt-4.1-mini', provider: 'openai', model: 'gpt-4.1-mini', inputPrice: 0.40, outputPrice: 1.60, avgPrice: 1.00 },
  { id: 'openai:gpt-4o', provider: 'openai', model: 'gpt-4o', inputPrice: 2.50, outputPrice: 10.00, avgPrice: 6.25 },
  { id: 'openai:gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini', inputPrice: 0.15, outputPrice: 0.60, avgPrice: 0.375 },

  // Google Gemini - https://ai.google.dev/pricing
  { id: 'gemini:gemini-3-pro-preview', provider: 'gemini', model: 'gemini-3-pro-preview', inputPrice: 7.00, outputPrice: 21.00, avgPrice: 14.00 },
  { id: 'gemini:gemini-2.5-pro', provider: 'gemini', model: 'gemini-2.5-pro', inputPrice: 1.25, outputPrice: 5.00, avgPrice: 3.125 },
  { id: 'gemini:gemini-2.5-flash', provider: 'gemini', model: 'gemini-2.5-flash', inputPrice: 0.15, outputPrice: 0.60, avgPrice: 0.375 },
  { id: 'gemini:gemini-2.5-flash-lite', provider: 'gemini', model: 'gemini-2.5-flash-lite', inputPrice: 0.075, outputPrice: 0.30, avgPrice: 0.1875 },
  { id: 'gemini:gemini-2.0-flash', provider: 'gemini', model: 'gemini-2.0-flash', inputPrice: 0.10, outputPrice: 0.40, avgPrice: 0.25 },
  { id: 'gemini:gemini-1.5-pro', provider: 'gemini', model: 'gemini-1.5-pro', inputPrice: 1.25, outputPrice: 5.00, avgPrice: 3.125 },

  // Anthropic Claude - https://www.anthropic.com/pricing
  { id: 'claude:claude-opus-4-5', provider: 'claude', model: 'claude-opus-4-5', inputPrice: 15.00, outputPrice: 75.00, avgPrice: 45.00 },
  { id: 'claude:claude-sonnet-4-5', provider: 'claude', model: 'claude-sonnet-4-5', inputPrice: 3.00, outputPrice: 15.00, avgPrice: 9.00 },
  { id: 'claude:claude-haiku-4-5', provider: 'claude', model: 'claude-haiku-4-5', inputPrice: 0.80, outputPrice: 4.00, avgPrice: 2.40 },
  { id: 'claude:claude-opus-4-0', provider: 'claude', model: 'claude-opus-4-0', inputPrice: 15.00, outputPrice: 75.00, avgPrice: 45.00 },
  { id: 'claude:claude-sonnet-4-0', provider: 'claude', model: 'claude-sonnet-4-0', inputPrice: 3.00, outputPrice: 15.00, avgPrice: 9.00 },
  { id: 'claude:claude-3-7-sonnet-latest', provider: 'claude', model: 'claude-3-7-sonnet-latest', inputPrice: 3.00, outputPrice: 15.00, avgPrice: 9.00 },

  // xAI Grok - https://docs.x.ai/docs/models
  { id: 'grok:grok-4-fast-non-reasoning', provider: 'grok', model: 'grok-4-fast-non-reasoning', inputPrice: 3.00, outputPrice: 15.00, avgPrice: 9.00 },
  { id: 'grok:grok-4-fast-reasoning', provider: 'grok', model: 'grok-4-fast-reasoning', inputPrice: 5.00, outputPrice: 25.00, avgPrice: 15.00 },
  { id: 'grok:grok-4', provider: 'grok', model: 'grok-4', inputPrice: 10.00, outputPrice: 40.00, avgPrice: 25.00 },
  { id: 'grok:grok-3', provider: 'grok', model: 'grok-3', inputPrice: 3.00, outputPrice: 15.00, avgPrice: 9.00 },
  { id: 'grok:grok-3-fast', provider: 'grok', model: 'grok-3-fast', inputPrice: 1.00, outputPrice: 5.00, avgPrice: 3.00 },
]

// Helper to get pricing by model ID
export const getPricing = (id: string): ModelPricing | undefined => {
  return modelPricing.find((p) => p.id === id)
}

// Helper to get all pricing as a map
export const getPricingMap = (): Map<string, ModelPricing> => {
  return new Map(modelPricing.map((p) => [p.id, p]))
}


