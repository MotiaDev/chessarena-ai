import type { Key } from 'chessground/types'

export type Message = {
  id: string
  message: string
  sender: string
  role: GameRole
  timestamp: number
  move?: {
    from: string
    to: string
    promotion?: 'q' | 'r' | 'b' | 'n'
  }
  isIllegalMove?: boolean
}

export type Password = { white: string; black: string }
export type Player = { name: string; ai?: 'openai' | 'gemini' | 'claude' }
export type Players = { white: Player; black: Player }

export type Game = {
  id: string
  fen: string
  turn: 'white' | 'black'
  endGameReason?: string
  winner?: 'white' | 'black'
  status: 'created' | 'pending' | 'completed' | 'draw' | 'requires-retry'
  lastMove: Key[]
  players: { white: Player; black: Player }
  scoreboard?: Scoreboard
}

export type GameRole = 'white' | 'black' | 'spectator' | 'root'

export type GameWithRole = Game & {
  role: GameRole
  username: string
  passwords?: Password
}

export type PlayerAnalysis = {
  strength: number
  consistency: number
  trend: number
  reliability: number
  gamesAnalyzed: number
  whiteGames: number
  blackGames: number
}

export type GameEvaluation = {
  evaluation: number
  color: 'white' | 'black'
  timestamp: number
}

export type Leaderboard = {
  provider: 'openai' | 'gemini' | 'claude'
  model: string
  draws: number
  gamesPlayed: number
  illegalMoves: number
  model: string
  provider: string
  sumCentipawnScores: number
  sumHighestSwing: number
  victories: number
  checkmates: number
}

export type PlayerScore = {
  averageSwing: number
  medianSwing: number
  highestSwing: number
  highestCentipawnScore: number
  lowestCentipawnScore: number
  averageCentipawnScore: number
  medianCentipawnScore: number
  finalCentipawnScore: number
  blunders: number
}

export type Scoreboard = {
  white: PlayerScore
  black: PlayerScore
  totalMoves: number
  decisiveMoment?: {
    moveNumber: number
    evaluationSwing: number
    move: string[]
    fen: string
  }
}
