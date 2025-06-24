import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { Key } from 'chessground/types'
import { OctagonX } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../ui/chat/chat-bubble'
import { ChessMove } from './chess-move'

type Props = {
  message: Message
  isLast?: boolean
}

const avatarImages = {
  openai: '/openai.png',
  gemini: '/gemini.png',
  claude: '/claude.webp',
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
        color={message.role === 'white' ? 'white' : 'black'}
        fallback={message.sender.slice(0, 1).toUpperCase()}
        src={avatarImages[message.sender as keyof typeof avatarImages] ?? undefined}
      />
      <ChatBubbleMessage>
        <div className="flex flex-row text-md font-semibold mb-3 capitalize">
          {message.sender}
          {message.role === 'spectator' && <span className="text-muted-foreground"> (Spectator)</span>}
        </div>
        <p className="text-md font-medium whitespace-pre-wrap">{message.message}</p>
        {message.move && (
          <div className={cn('mt-3', message.isIllegalMove && 'bg-error border-2 rounded-xl p-3')}>
            {message.isIllegalMove && (
              <div className="text-error font-medium mb-2 flex flex-row gap-1 items-center">
                <OctagonX className="size-4" /> This move is illegal. Trying another...
              </div>
            )}
            <div
              className={cn(
                'flex flex-row justify-between font-medium w-full p-4 bg-white/5 rounded-sm font-medium items-center',
                message.isIllegalMove ? 'bg-black/60' : 'bg-black/20',
              )}
            >
              {message.role === 'white' ? 'White move' : 'Black move'}
              <ChessMove move={[message.move.from as Key, message.move.to as Key]} />
            </div>
          </div>
        )}
      </ChatBubbleMessage>
    </ChatBubble>
  )
}
