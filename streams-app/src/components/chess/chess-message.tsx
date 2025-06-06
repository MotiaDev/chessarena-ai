import { X } from 'lucide-react'
import type React from 'react'
import { cn } from '../../lib/utils'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../ui/chat/chat-bubble'
import type { Message, Player } from './types'
import { useEffect } from 'react'

type Props = {
  message: Message
  players?: { white: Player; black: Player }
  isLast?: boolean
  parentRef: React.RefObject<HTMLDivElement | null>
}

const avatarImages = {
  openai: '/openai.png',
  gemini: '/gemini.jpeg',
  claude: '/claude.webp',
}

export const ChessMessage: React.FC<Props> = ({ message, players, isLast, parentRef }) => {
  useEffect(() => {
    if (isLast) {
      parentRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' })
    }
  }, [isLast, message.message])

  const player = players?.[message.sender]

  return (
    <ChatBubble variant={message.sender === 'white' ? 'sent' : 'received'}>
      <ChatBubbleAvatar
        fallback={player ? player.name : '--'}
        src={player && player.ai ? avatarImages[player.ai] : undefined}
      />
      <ChatBubbleMessage>
        <p>{message.message}</p>
        {message.move && (
          <div
            className={cn(
              'flex gap-1 py-1 px-2 rounded-md mt-2 items-center',
              message.isIllegalMove ? 'bg-red-900/30 text-red-500' : 'bg-black/50 text-muted-foreground',
            )}
          >
            <X className="w-4 h-4" />
            <p>
              Move: {message.move.from} → {message.move.to}
            </p>
          </div>
        )}
      </ChatBubbleMessage>
    </ChatBubble>
  )
}
