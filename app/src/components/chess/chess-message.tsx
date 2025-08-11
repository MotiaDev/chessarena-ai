import { useScrollIntoView } from '@/lib/use-scroll-into-view'
import { cn } from '@/lib/utils'
import type { AiModelProvider } from '@chessarena/types/ai-models'
import type { GameMessage } from '@chessarena/types/game-message'
import { OctagonX } from 'lucide-react'
import React, { memo } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../ui/chat/chat-bubble'
import { ChessMove } from './chess-move'

type Props = {
  message: GameMessage
  isLast?: boolean
}

type ChessPlayer = { [key in AiModelProvider]: string }
type ChessPlayers = { black: ChessPlayer; white: ChessPlayer }

const avatarImages: ChessPlayers = {
  black: {
    openai: '/avatars/openai-black.png',
    gemini: '/avatars/gemini-black.png',
    claude: '/avatars/claude.webp',
    grok: '/avatars/grok-white.png',
  },
  white: {
    openai: '/avatars/openai-white.png',
    gemini: '/avatars/gemini-white.png',
    claude: '/avatars/claude.webp',
    grok: '/avatars/grok-white.png',
  },
}

export const ChessMessage: React.FC<Props> = memo(({ message, isLast }) => {
  const ref = useScrollIntoView(!!isLast)

  if (message.role === 'spectator') {
    return null
  }

  const role = message.role === 'root' ? 'white' : message.role
  const image = avatarImages[role]?.[message.sender as keyof (typeof avatarImages)[typeof role]]

  return (
    <ChatBubble variant={role} ref={ref}>
      <ChatBubbleAvatar
        color={message.role === 'white' ? 'white' : 'black'}
        fallback={message.sender.slice(0, 1).toUpperCase()}
        src={image}
      />
      <ChatBubbleMessage>
        <div className="flex flex-row text-md font-semibold mb-3 capitalize">
          <div className="capitalize">{message.sender}</div>
        </div>
        <p className="text-md font-medium whitespace-pre-wrap">{message.message}</p>
        {message.isIllegalMove && (
          <div className="mt-3 bg-[#FDCFE0] border-2 rounded-md p-3 text-[#F40D62] font-medium flex flex-row gap-2 items-start font-semibold">
            <OctagonX className="size-5 mt-0.5" />
            This move is illegal
          </div>
        )}
        {message.move && (
          <div
            className={cn(
              'flex flex-row justify-between font-medium w-full p-4 rounded-sm font-medium items-center mt-3',
              message.role === 'white' ? 'bg-white' : 'bg-black',
            )}
          >
            {message.role === 'white' ? 'White move' : 'Black move'}
            <ChessMove move={[message.move.from, message.move.to]} color={role} />
          </div>
        )}
      </ChatBubbleMessage>
    </ChatBubble>
  )
})
