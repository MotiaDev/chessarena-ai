import type { Game } from '@/lib/types'
import { useEffect, useRef } from 'react'

type Props = {
  game: Game
}

export const ChessSound: React.FC<Props> = ({ game }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playMoveSound = () => audioRef.current?.play()

  useEffect(() => {
    if (game.lastMove) {
      playMoveSound()
    }
  }, [game.fen])

  return (
    <audio ref={audioRef}>
      <source src="/sounds/chess-move.mp3" type="audio/mpeg" />
    </audio>
  )
}
