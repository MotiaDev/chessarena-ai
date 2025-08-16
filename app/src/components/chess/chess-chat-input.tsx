import { Button } from '@/components/ui/button'
import { ChatInput } from '@/components/ui/chat/chat-input'
import type { GameWithRole } from '@/lib/types'
import { useSendMessage } from '@/lib/use-send-message'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

type Props = {
  game: GameWithRole
}

export const ChessChatInput: React.FC<Props> = ({ game }) => {
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')
  const sendMessage = useSendMessage(game.id)

  const handleSendMessage = async () => {
    if (game && message.trim().length > 0 && !isSending) {
      setIsSending(true)

      try {
        await sendMessage({ message, name: game.username })
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

  return (
    <div className="w-full flex flex-row gap-2 items-center">
      <ChatInput
        placeholder="Chat something"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        data-testid="send-message-button"
        variant="default"
        className="h-12 w-12"
        onClick={handleSendMessage}
        disabled={isSending}
      >
        {isSending ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
      </Button>
    </div>
  )
}
