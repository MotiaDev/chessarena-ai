import { AiModelProvider, AiModels, AiProviderDefaultModel } from '@chessarena/types/ai-models'

// NOTE: these are the models used for AI vs AI games, it is also used for backwards compatibility for existing games that don't have a model assigned to a player
export const models: AiProviderDefaultModel = {
  openai: 'o4-mini-2025-04-16',
  gemini: 'gemini-2.5-flash',
  claude: 'claude-sonnet-4-20250514',
  grok: 'grok-3',
}

// NOTE: these are all the models supported by provider that users can pick in order to play human vs AI games
export const supportedModelsByProvider: AiModels = {
  openai: [
    // https://platform.openai.com/docs/models
    'gpt-5-2025-08-07',
    'o4-mini-2025-04-16',
    'gpt-4.1-nano-2025-04-14',
    'gpt-4.1-mini-2025-04-14',
    'o3-mini-2025-01-31',
    'gpt-4o-mini-2024-07-18',
  ],
  gemini: [
    // https://ai.google.dev/gemini-api/docs/models
    'gemini-2.5-flash',
    'gemini-2.0-flash-001',
  ],
  claude: [
    // https://docs.anthropic.com/en/docs/about-claude/models/overview
    'claude-opus-4-1-20250805',
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
  ],
  grok: [
    // https://docs.x.ai/docs/models
    'grok-4',
    'grok-3',
  ],
}
