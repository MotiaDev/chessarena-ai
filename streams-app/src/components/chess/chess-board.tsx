import { useStreamItem } from '@motiadev/stream-client-react'
import { Chess, SQUARES } from 'chess.js'
import type { Config } from 'chessground/config'
import type { Key } from 'chessground/types'
import { useEffect, useState } from 'react'
import { Chessground } from './chessground'
import { useChessInstance } from '../../lib/use-chess-instance'
import { useMove } from '../../lib/use-move'
import type { Game, GameRole } from './types'

export function toDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map()

  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true })
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to),
      )
  })

  return dests
}

type Props = { gameId: string; password?: string; role: GameRole }

export const ChessBoard: React.FC<Props> = ({ gameId, password, role }) => {
  const { getInstance } = useChessInstance()
  const { data: game } = useStreamItem<Game>({
    streamName: 'chessGame',
    groupId: 'game',
    id: gameId,
  })
  const move = useMove({ gameId })
  const [moves, setMoves] = useState<Map<Key, Key[]>>(new Map())

  useEffect(() => {
    if (game?.fen) {
      const chess = getInstance()
      chess.load(game.fen)
      const dests = toDests(chess)
      setMoves(dests)
    }
  }, [game?.fen])

  if (!game) {
    return <Chessground />
  }

  // define based on the role
  const color = role === 'white' ? 'white' : role === 'black' ? 'black' : role === 'root' ? game.turn : undefined

  const config: Config = {
    fen: game.fen,
    orientation: 'white',
    turnColor: game.turn,
    coordinates: true,
    lastMove: game.lastMove,
    movable: { color, free: false, showDests: true, dests: moves },
    events: {
      move: (from, to) => {
        if (password) move(from, to, password)
      },
    },
  }

  return <Chessground config={config} />
}
