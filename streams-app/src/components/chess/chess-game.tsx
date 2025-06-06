import { useGetGame } from '@/lib/use-get-game'
import { Send, Share, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { ChessBoard } from './chess-board'
import { ChessMessages } from './chess-messages'
import { ChessShare } from './chess-share'
import { ChatInput } from '../ui/chat/chat-input'
import { useSendMessage } from '../../lib/use-send-message'

type Props = {
  gameId: string
  password?: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, password, onClose }) => {
  const game = useGetGame(gameId, password)
  const [shareOpen, setShareOpen] = useState(false)
  const [message, setMessage] = useState('')
  const sendMessage = useSendMessage(gameId)

  const handleSendMessage = async () => {
    if (game && message.trim().length > 0) {
      await sendMessage({ message, name: game.username, role: game.role })
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleSendMessage()
    }
  }

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
      <div className="w-screen max-w-[600px] overflow-y-auto flex-1 gap-4 p-4 flex flex-col">
        <ChessMessages gameId={gameId} />

        <div className="flex flex-row gap-2 items-center">
          <ChatInput value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} />
          <Button variant="secondary" className="h-12 w-12" onClick={handleSendMessage}>
            <Send />
          </Button>
        </div>
      </div>

      <ChessShare open={shareOpen} onOpenChange={setShareOpen} game={game} />
    </div>
  )
}
