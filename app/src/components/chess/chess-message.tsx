import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { Key } from 'chessground/types'
import { OctagonX } from 'lucide-react'
import React, { memo, useEffect, useRef } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../ui/chat/chat-bubble'
import { ChessMove } from './chess-move'

type Props = {
  message: Message
  isLast?: boolean
}

const avatarImages = {
  black: {
    openai: '/avatars/openai-black.png',
    gemini: '/avatars/gemini-black.png',
    claude: '/avatars/claude.webp',
  },
  white: {
    openai: '/avatars/openai-white.png',
    gemini: '/avatars/gemini-white.png',
    claude: '/avatars/claude.webp',
  },
}

export const ChessMessage: React.FC<Props> = memo(({ message, isLast }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLast && ref.current) {
      ref.current.scrollIntoView({ behavior: 'instant', block: 'end' })
    }
  }, [isLast, message.message])

  const image =
    message.role === 'spectator'
      ? '/avatars/spectator-blue.png'
      : avatarImages[message.role as keyof typeof avatarImages]?.[
          message.sender as keyof (typeof avatarImages)[keyof typeof avatarImages]
        ]

  return (
    <ChatBubble variant={message.role === 'white' ? 'sent' : 'received'} ref={ref}>
      <ChatBubbleAvatar
        color={message.role === 'white' ? 'white' : 'black'}
        fallback={message.sender.slice(0, 1).toUpperCase()}
        src={image}
      />
      <ChatBubbleMessage>
        <div className="flex flex-row text-md font-semibold mb-3 capitalize">
          <div className="capitalize">{message.sender}</div>
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
})
