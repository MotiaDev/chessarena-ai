import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../ui/chat/chat-bubble'

type Props = {
  message: Message
  isLast?: boolean
}

const avatarImages = {
  OpenAI: '/openai.png',
  Gemini: '/gemini.jpeg',
  Claude: '/claude.webp',
}

export const ChessMessage: React.FC<Props> = ({ message, isLast }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLast && ref.current) {
      ref.current.scrollIntoView({ behavior: 'instant', block: 'end' })
    }
  }, [isLast, message.message])

  return (
    <ChatBubble variant={message.role === 'white' ? 'sent' : 'received'} ref={ref}>
      <ChatBubbleAvatar
        fallback={message.sender.slice(0, 1).toUpperCase()}
        src={avatarImages[message.sender as keyof typeof avatarImages] ?? undefined}
      />
      <ChatBubbleMessage>
        <div className="flex flex-row text-xs font-bold uppercase mb-1">
          {message.sender}
          {message.role === 'spectator' && <span className="text-muted-foreground"> (Spectator)</span>}
        </div>
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
