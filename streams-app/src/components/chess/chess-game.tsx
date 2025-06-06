import { Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGetGame } from '../../lib/use-get-game'
import { Button } from '../ui/button'
import { ChessBoard } from './chess-board'
import { ChessMessages } from './chess-messages'
import { ChessShare } from './chess-share'

type Props = {
  gameId: string
  password?: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, password, onClose }) => {
  const game = useGetGame(gameId, password)
  const [shareOpen, setShareOpen] = useState(false)

  if (!game) {
    return null
  }

  return (
    <div className="flex flex-col items-center mx-auto w-screen h-screen">
      <header className="flex flex-row gap-2 items-center justify-between p-2 w-full">
        <img src="/logo-white.svg" alt="Motia Logo" className="h-3" />
        {game.players && (
          <div className="flex flex-1 flex-row gap-2 items-center justify-center font-bold text-sm text-center">
            {game.players.white.name} vs. {game.players.black.name}
          </div>
        )}
        <div className="flex flex-row gap-2 items-center justify-end">
          <Button variant="default" size="icon" onClick={() => setShareOpen(true)}>
            <Share />
          </Button>
          <Button variant="secondary" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
      </header>
      <ChessBoard gameId={gameId} password={password} role={game.role} />
      <div className="w-screen max-w-[600px] overflow-y-auto flex-1 px-4">
        <ChessMessages gameId={gameId} />
      </div>

      <ChessShare open={shareOpen} onOpenChange={setShareOpen} game={game} />
    </div>
  )
}
