import type { Message } from '@/lib/types'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ChessMessage } from './chess-message'

type Props = { gameId: string }

export const ChessMessages: React.FC<Props> = ({ gameId }) => {
  const { data: messages } = useStreamGroup<Message>({
    streamName: 'chessGameMessage',
    groupId: `${gameId}-messages`,
  })

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {messages.map((message, index) => (
        <ChessMessage key={message.id} message={message} isLast={index === messages.length - 1} />
      ))}
    </div>
  )
}
