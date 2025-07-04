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
  winner?: 'white' | 'black'
  status: 'created' | 'pending' | 'completed' | 'draw'
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

export type Leaderboard = {
  provider: 'openai' | 'gemini' | 'claude'
  model: string
  gamesPlayed: number
  wins: number
  draws: number
  illegalMoves: number
}

export type Scoreboard = {
  white: {
    name: string
    score: number
    averageEval: number
    avgSwing: number
    finalEval: number
    trend: string
  }
  black: {
    name: string
    score: number
    averageEval: number
    avgSwing: number
    finalEval: number
    trend: string
  }
  gameStatus: string
  totalMoves: number
  decisiveMoment?: {
    moveNumber: number
    evalChange: number
    fen: string
  }
}

