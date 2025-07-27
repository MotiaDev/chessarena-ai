import { Models } from './types'

export const models: Record<Models, string> = {
  openai: 'o4-mini-2025-04-16',
  gemini: 'gemini-2.5-flash',
  claude: 'claude-4-sonnet',
}

export const supportedModelsByProvider: Record<Models, string[]> = {
  openai: ['o4-mini-2025-04-16', 'gpt-4o-mini-2024-07-18'],
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash-001'],
  claude: ['claude-4-sonnet', 'claude-3-5-sonnet-20241022'],
}