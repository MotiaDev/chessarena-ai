import { useGetGame } from '@/lib/use-get-game'
import { useStreamItem } from '@motiadev/stream-client-react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { Game } from '../../lib/types'
import { useSendMessage } from '../../lib/use-send-message'
import { cn } from '../../lib/utils'
import { MotiaPowered } from '../motia-powered'
import { Button } from '../ui/button'
import { ChatInput } from '../ui/chat/chat-input'
import { ChessBoard } from './chess-board'
import { ChessLastGameMove } from './chess-last-game-move'
import { ChessMessages } from './chess-messages'
import { ChessShare } from './chess-share'

type Props = {
  gameId: string
  password?: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, password, onClose }) => {
  const gameWithRole = useGetGame(gameId, password)
  const { data: game } = useStreamItem<Game>({
    streamName: 'chessGame',
    groupId: 'game',
    id: gameId,
  })
  const [message, setMessage] = useState('')
  const sendMessage = useSendMessage(gameId)
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (gameWithRole && message.trim().length > 0 && !isSending) {
      setIsSending(true)

      try {
        await sendMessage({ message, name: gameWithRole.username, role: gameWithRole.role })
        setMessage('')
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      handleSendMessage()
    }
  }

  if (!game || !gameWithRole) {
    return null
  }

  return (
    <div className="flex flex-col items-center mx-auto w-screen h-screen justify-between">
      <div className="flex md:flex-row max-md:flex-col items-center justify-between w-full h-screen">
        <header className="md:hidden flex flex-row gap-2 items-center justify-between p-4 w-full md:border-b-2 md:border-white/5">
          <ArrowLeft onClick={onClose} />
          <MotiaPowered size="sm" />
          <div className="flex flex-row gap-2 items-center justify-end">
            <ChessShare game={gameWithRole} />
          </div>
        </header>

        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-full h-full flex items-center justify-center">
            <ChessBoard game={game} password={password} role={gameWithRole.role} />
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col flex-1 gap-4 items-center justify-between w-screen h-screen backdrop-blur-lg',
            'max-md:w-full lg:min-w-[500px] md:border-l-2 md:border-white/5',
          )}
        >
          <header className="max-md:hidden flex flex-row gap-2 items-center justify-between p-6 w-full md:border-b-2 md:border-white/5">
            <Button variant="default" className="h-12 w-12" onClick={onClose}>
              <ArrowLeft className="size-5" />
            </Button>

            <MotiaPowered size="sm" />

            <ChessShare game={gameWithRole} />
          </header>

          <ChessLastGameMove game={game} />

          <div className="overflow-y-auto gap-4 pb-4 px-4 flex flex-col flex-1 w-full">
            <ChessMessages gameId={gameId} />

            <div className="flex flex-row gap-2 items-center">
              <ChatInput
                placeholder="Chat something"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="default" className="h-12 w-12" onClick={handleSendMessage} disabled={isSending}>
                {isSending ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
