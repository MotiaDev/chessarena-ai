import type { Game } from '@chessarena/types/game'
import type { GameRole } from '@/lib/types'
import { useChessInstance } from '@/lib/use-chess-instance'
import { useMove } from '@/lib/use-move'
import { Chess, SQUARES, type Square } from 'chess.js'
import type { Config } from 'chessground/config'
import type { Key, Role } from 'chessground/types'
import { useEffect, useState } from 'react'
import { Chessground } from './chessground'
import { ChessPromote } from './promote/chess-promote'
import { ChessSound } from './chess-sound'

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

type Props = {
  password?: string
  role: GameRole
  game: Game
}

type Promote = { from: Key; to: Key; color: 'white' | 'black' }

export const ChessBoard: React.FC<Props> = ({ password, role, game }) => {
  const { getInstance } = useChessInstance()

  const move = useMove({ gameId: game.id })
  const [moves, setMoves] = useState<Map<Key, Key[]>>(new Map())
  const [promote, setPromote] = useState<Promote>()

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

  const onPromote = (piece: Role) => {
    if (!promote || !password) return

    move(promote.from, promote.to, password, piece)
    setPromote(undefined)
  }

  // define based on the role
  const color = role === 'white' ? 'white' : role === 'black' ? 'black' : role === 'root' ? game.turn : undefined

  const config: Config = {
    fen: game.fen,
    orientation: role === 'black' ? 'black' : 'white',
    turnColor: game.turn,
    coordinates: true,
    lastMove: game.lastMove as Key[] | undefined,
    movable: { color, free: false, showDests: true, dests: moves },
    events: {
      move: (from, to) => {
        if (!password) return

        const chess = getInstance()
        const piece = chess.get(from as Square)
        const color = piece?.color === 'w' ? 'white' : 'black'
        const line = to[1]
        const isPawn = piece && piece.type === 'p'

        if ((isPawn && color === 'white' && line === '8') || (color === 'black' && line === '1')) {
          setPromote({ from, to, color })
        } else {
          move(from, to, password)
        }
      },
    },
  }

  return (
    <>
      <Chessground config={config} />
      <ChessSound game={game} />
      <ChessPromote color={game.turn} isOpen={!!promote} onPromote={onPromote} />
    </>
  )
}
