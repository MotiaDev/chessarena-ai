import { Models } from './types'

// NOTE: these are the models used for AI vs AI games, it is also used for backwards compatibility for existing games that don't have a model assigned to a player
export const models: Record<Models, string> = {
  openai: 'o4-mini-2025-04-16',
  gemini: 'gemini-2.5-flash',
  claude: 'claude-3-5-sonnet-20241022',
}

// NOTE: these are all the models supported by provider that users can pick in order to play human vs AI games
export const supportedModelsByProvider: Record<Models, string[]> = {
  openai: ['o4-mini-2025-04-16', 'gpt-4.1-nano-2025-04-14', 'gpt-4.1-mini-2025-04-14', 'o3-mini-2025-01-31', 'gpt-4o-mini-2024-07-18'],
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash-001'],
  claude: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
}