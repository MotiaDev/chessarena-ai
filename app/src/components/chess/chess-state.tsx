import React from 'react'
import { Chessground } from './chessground'
import type { Config } from '@lichess-org/chessground/config'
import type { Key } from '@lichess-org/chessground/types'

export const ChessMove: React.FC<{ fen: string; lastMove: Key[] }> = ({ fen, lastMove }) => {
  const config: Config = {
    fen,
    orientation: 'white',
    lastMove,
    coordinates: false,
  }

  return <Chessground config={config} />
}
