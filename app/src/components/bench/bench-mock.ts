// NOTE: This list mimics 'api/services/ai/models.ts'
// We mock scores to look realistic based on early results.
export const mockBenchLeaderboard: BenchModelRow[] = [
  // OpenAI
  { id: 'openai:gpt-5.2', provider: 'openai', model: 'gpt-5.2', motiaChessIndex: 94, legalMoveScore: 99, puzzleScore: 89, acpl: 25, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-5.1', provider: 'openai', model: 'gpt-5.1', motiaChessIndex: 91, legalMoveScore: 98, puzzleScore: 85, acpl: 30, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-5', provider: 'openai', model: 'gpt-5', motiaChessIndex: 88, legalMoveScore: 95, puzzleScore: 81, acpl: 35, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-5-mini', provider: 'openai', model: 'gpt-5-mini', motiaChessIndex: 82, legalMoveScore: 90, puzzleScore: 75, acpl: 45, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-4.1', provider: 'openai', model: 'gpt-4.1', motiaChessIndex: 85, legalMoveScore: 93, puzzleScore: 78, acpl: 40, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-4.1-mini', provider: 'openai', model: 'gpt-4.1-mini', motiaChessIndex: 78, legalMoveScore: 85, puzzleScore: 70, acpl: 55, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-4o', provider: 'openai', model: 'gpt-4o', motiaChessIndex: 75, legalMoveScore: 82, puzzleScore: 68, acpl: 60, lastUpdatedAt: Date.now() },
  { id: 'openai:gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini', motiaChessIndex: 65, legalMoveScore: 70, puzzleScore: 60, acpl: 75, lastUpdatedAt: Date.now() },

  // Google
  { id: 'gemini:gemini-3-pro-preview', provider: 'gemini', model: 'gemini-3-pro-preview', motiaChessIndex: 95, legalMoveScore: 99, puzzleScore: 91, acpl: 22, lastUpdatedAt: Date.now() },
  { id: 'gemini:gemini-2.5-pro', provider: 'gemini', model: 'gemini-2.5-pro', motiaChessIndex: 89, legalMoveScore: 96, puzzleScore: 82, acpl: 32, lastUpdatedAt: Date.now() },
  { id: 'gemini:gemini-2.5-flash', provider: 'gemini', model: 'gemini-2.5-flash', motiaChessIndex: 72, legalMoveScore: 78, puzzleScore: 66, acpl: 65, lastUpdatedAt: Date.now() },
  { id: 'gemini:gemini-2.5-flash-lite', provider: 'gemini', model: 'gemini-2.5-flash-lite', motiaChessIndex: 60, legalMoveScore: 65, puzzleScore: 55, acpl: 80, lastUpdatedAt: Date.now() },
  { id: 'gemini:gemini-2.0-flash', provider: 'gemini', model: 'gemini-2.0-flash', motiaChessIndex: 68, legalMoveScore: 75, puzzleScore: 62, acpl: 70, lastUpdatedAt: Date.now() },
  { id: 'gemini:gemini-1.5-pro', provider: 'gemini', model: 'gemini-1.5-pro', motiaChessIndex: 76, legalMoveScore: 85, puzzleScore: 68, acpl: 58, lastUpdatedAt: Date.now() },

  // Anthropic
  { id: 'claude:claude-opus-4-5', provider: 'claude', model: 'claude-opus-4-5', motiaChessIndex: 93, legalMoveScore: 98, puzzleScore: 88, acpl: 28, lastUpdatedAt: Date.now() },
  { id: 'claude:claude-sonnet-4-5', provider: 'claude', model: 'claude-sonnet-4-5', motiaChessIndex: 90, legalMoveScore: 97, puzzleScore: 84, acpl: 33, lastUpdatedAt: Date.now() },
  { id: 'claude:claude-haiku-4-5', provider: 'claude', model: 'claude-haiku-4-5', motiaChessIndex: 84, legalMoveScore: 92, puzzleScore: 76, acpl: 42, lastUpdatedAt: Date.now() },
  { id: 'claude:claude-opus-4-0', provider: 'claude', model: 'claude-opus-4-0', motiaChessIndex: 86, legalMoveScore: 94, puzzleScore: 79, acpl: 38, lastUpdatedAt: Date.now() },
  { id: 'claude:claude-sonnet-4-0', provider: 'claude', model: 'claude-sonnet-4-0', motiaChessIndex: 83, legalMoveScore: 91, puzzleScore: 75, acpl: 44, lastUpdatedAt: Date.now() },
  { id: 'claude:claude-3-7-sonnet-latest', provider: 'claude', model: 'claude-3-7-sonnet-latest', motiaChessIndex: 80, legalMoveScore: 88, puzzleScore: 72, acpl: 50, lastUpdatedAt: Date.now() },

  // xAI
  { id: 'grok:grok-4-fast-non-reasoning', provider: 'grok', model: 'grok-4-fast-non-reasoning', motiaChessIndex: 28, legalMoveScore: 28, puzzleScore: 28, acpl: 150, lastUpdatedAt: Date.now() },
  { id: 'grok:grok-4-fast-reasoning', provider: 'grok', model: 'grok-4-fast-reasoning', motiaChessIndex: 92, legalMoveScore: 95, puzzleScore: 89, acpl: 29, lastUpdatedAt: Date.now() },
  { id: 'grok:grok-4', provider: 'grok', model: 'grok-4', motiaChessIndex: 88, legalMoveScore: 93, puzzleScore: 83, acpl: 36, lastUpdatedAt: Date.now() },
  { id: 'grok:grok-3', provider: 'grok', model: 'grok-3', motiaChessIndex: 70, legalMoveScore: 75, puzzleScore: 65, acpl: 68, lastUpdatedAt: Date.now() },
  { id: 'grok:grok-3-fast', provider: 'grok', model: 'grok-3-fast', motiaChessIndex: 55, legalMoveScore: 60, puzzleScore: 50, acpl: 90, lastUpdatedAt: Date.now() },
]

export type BenchTimeseriesPoint = { t: number; v: number }

export type BenchModelRow = {
  id: string
  provider: string
  model: string
  motiaChessIndex: number
  legalMoveScore: number
  puzzleScore: number
  acpl: number
  lastUpdatedAt: number
}

export const mockBenchTimeseries = {
  legalMoveScore: [
    { t: Date.now() - 6 * 86400000, v: 62 },
    { t: Date.now() - 5 * 86400000, v: 64 },
    { t: Date.now() - 4 * 86400000, v: 66 },
    { t: Date.now() - 3 * 86400000, v: 68 },
    { t: Date.now() - 2 * 86400000, v: 70 },
    { t: Date.now() - 1 * 86400000, v: 72 },
    { t: Date.now(), v: 73 },
  ],
  puzzleScore: [
    { t: Date.now() - 6 * 86400000, v: 44 },
    { t: Date.now() - 5 * 86400000, v: 47 },
    { t: Date.now() - 4 * 86400000, v: 49 },
    { t: Date.now() - 3 * 86400000, v: 51 },
    { t: Date.now() - 2 * 86400000, v: 52 },
    { t: Date.now() - 1 * 86400000, v: 54 },
    { t: Date.now(), v: 55 },
  ],
  acpl: [
    { t: Date.now() - 6 * 86400000, v: 78 },
    { t: Date.now() - 5 * 86400000, v: 75 },
    { t: Date.now() - 4 * 86400000, v: 73 },
    { t: Date.now() - 3 * 86400000, v: 70 },
    { t: Date.now() - 2 * 86400000, v: 68 },
    { t: Date.now() - 1 * 86400000, v: 66 },
    { t: Date.now(), v: 65 },
  ],
}

export const mockPrompts = {
  legalMoveBench: `You are a chess expert. Given the following game, list ALL legal moves available for the current player.

## Game (PGN)
{{pgn}}

## Current Position
It is {{turn}}'s turn to move.
FEN: {{fen}}

## Task
List ALL legal moves for {{turn}} in Standard Algebraic Notation (SAN).

## Response Format
Return ONLY a JSON object with no additional text:
{
  "moves": ["move1", "move2", "move3", ...]
}
`,
  puzzleBench: `You are a chess engine. Solve this puzzle in one move.

## Position
FEN: {{fen}}
Turn: {{turn}}

## Game context (PGN)
{{pgn}}

## Legal moves (SAN)
{{#legalMoves}}
- {{.}}
{{/legalMoves}}

## Response format (JSON only)
{
  "move": "SAN"
}
`,
  aiPlayerGuided: `You are a chess grandmaster playing as {{player}}.

## Current Position
- FEN: \`{{fen}}\`
{{#inCheck}}- WARNING: You are in check!{{/inCheck}}

## Valid Moves (Guided)
{{#validMoves}}- {{san}}
{{/validMoves}}

## Response Format (JSON only)
{
  "thought": "Strategic reasoning",
  "moveSan": "Your move in SAN"
}
`,
}
