const NOW = Date.now()

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const hash01 = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

const seeded = (seedStr: string) => {
  let t = Math.floor(hash01(seedStr) * 0xffffffff) >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

const normalish = (rand: () => number) => {
  const u = rand() || 1e-9
  const v = rand() || 1e-9
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const legalMoveSummary: Record<string, { averageScore: number; lastRunAt: number }> = {
  'grok:grok-4-fast-non-reasoning': { averageScore: 28.38477029006998, lastRunAt: 1766157466671 },
  'grok:grok-4-fast-reasoning': { averageScore: 95.0778179689851, lastRunAt: 1766158456823 },
  'gemini:gemini-3-pro-preview': { averageScore: 95.71476876793383, lastRunAt: 1766158866596 },
  'openai:gpt-5.2': { averageScore: 94.47529713518263, lastRunAt: 1766159361494 },
  'gemini:gemini-2.5-pro': { averageScore: 62.0246628219507, lastRunAt: 1766159574654 },
  'claude:claude-opus-4-5': { averageScore: 87.51753246753248, lastRunAt: 1766160119644 },
  'gemini:gemini-2.5-flash': { averageScore: 50.682398740759965, lastRunAt: 1766161062713 },
  'gemini:gemini-2.5-flash-lite': { averageScore: 30.926490100647793, lastRunAt: 1766161726694 },
  'gemini:gemini-2.0-flash': { averageScore: 57.6118913255696, lastRunAt: 1766161760105 },
}

const inferredLegalMoveScore: Record<string, number> = {
  'openai:gpt-5.1': 92.8,
  'openai:gpt-5': 90.1,
  'openai:gpt-5-mini': 83.8,
  'openai:gpt-4.1': 86.2,
  'openai:gpt-4.1-mini': 78.4,
  'openai:gpt-4o': 76.3,
  'openai:gpt-4o-mini': 67.6,

  'claude:claude-sonnet-4-5': 83.6,
  'claude:claude-haiku-4-5': 74.9,
  'claude:claude-opus-4-0': 85.2,
  'claude:claude-sonnet-4-0': 80.3,
  'claude:claude-3-7-sonnet-latest': 73.4,
  'claude:claude-3-5-haiku-latest': 65.9,

  'grok:grok-4': 92.0,
  'grok:grok-3': 69.7,
  'grok:grok-3-fast': 55.1,
}

const allModels: Array<{ provider: string; model: string }> = [
  ...[
    'gpt-5.2',
    'gpt-5.1',
    'gpt-5',
    'gpt-5-mini',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini',
  ].map((model) => ({ provider: 'openai', model })),
  ...['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'].map(
    (model) => ({ provider: 'gemini', model }),
  ),
  ...[
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-haiku-4-5',
    'claude-opus-4-0',
    'claude-sonnet-4-0',
    'claude-3-7-sonnet-latest',
    'claude-3-5-haiku-latest',
  ].map((model) => ({ provider: 'claude', model })),
  ...['grok-4-fast-non-reasoning', 'grok-4-fast-reasoning', 'grok-4', 'grok-3', 'grok-3-fast'].map((model) => ({
    provider: 'grok',
    model,
  })),
]

const computeRow = (provider: string, model: string): BenchModelRow => {
  const id = `${provider}:${model}`
  const summary = legalMoveSummary[id]

  const rand = seeded(id)
  const n1 = normalish(rand)
  const n2 = normalish(rand)
  const n3 = normalish(rand)

  const baseLegal = summary?.averageScore ?? inferredLegalMoveScore[id] ?? 50

  const legalSigma = provider === 'grok' ? 4.5 : provider === 'gemini' ? 4.0 : provider === 'claude' ? 4.2 : 3.6
  const legalMoveScore = clamp(baseLegal + n1 * legalSigma, 2, 99.8)

  const providerPuzzleBias = provider === 'openai' ? 3.0 : provider === 'claude' ? 1.5 : provider === 'gemini' ? 0.0 : -2.0
  const modelPuzzleSkew =
    model.includes('flash-lite') ? -8 :
    model.includes('flash') ? -3 :
    model.includes('mini') ? -4 :
    model.includes('non-reasoning') ? -10 :
    model.includes('reasoning') ? 4 :
    model.includes('opus') ? 4 :
    model.includes('pro') ? 3 : 0

  const puzzleScore = clamp(legalMoveScore * (0.78 + 0.08 * rand()) + providerPuzzleBias + modelPuzzleSkew + n2 * 7, 8, 98)

  const providerQualityBias = provider === 'openai' ? -6 : provider === 'claude' ? -3 : provider === 'gemini' ? 1 : 4
  const modelQualitySkew =
    model.includes('opus') || model.includes('pro') ? -8 :
    model.includes('mini') || model.includes('flash') ? 6 :
    model.includes('non-reasoning') ? 18 : 0

  const composite = 0.58 * puzzleScore + 0.42 * legalMoveScore
  const acpl = clamp(112 - composite + providerQualityBias + modelQualitySkew + n3 * 10 + (rand() - 0.5) * 6, 8, 120)

  const acplScore = clamp(100 - acpl, 0, 100)
  const motiaChessIndex = clamp(0.4 * legalMoveScore + 0.3 * puzzleScore + 0.3 * acplScore, 0, 100)

  return {
    id,
    provider,
    model,
    motiaChessIndex: Number(motiaChessIndex.toFixed(1)),
    legalMoveScore: Number(legalMoveScore.toFixed(1)),
    puzzleScore: Number(puzzleScore.toFixed(1)),
    acpl: Number(acpl.toFixed(1)),
    lastUpdatedAt: summary?.lastRunAt ?? NOW,
  }
}

export const mockBenchLeaderboard: BenchModelRow[] = allModels.map(({ provider, model }) => computeRow(provider, model))

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



