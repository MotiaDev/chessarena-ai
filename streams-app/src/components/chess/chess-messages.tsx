import type { Message } from '@/lib/types'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ChessMessage } from './chess-message'

type Props = { gameId: string }

export const ChessMessages: React.FC<Props> = ({ gameId }) => {
  const { data: gameMessages } = useStreamGroup<Message>({
    streamName: 'chessGameMessage',
    groupId: gameId,
  })

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full">
      <div className="flex flex-1 flex-col gap-2 w-full">
        {gameMessages.map((message, index) => (
          <ChessMessage key={message.id || index} message={message} isLast={index === gameMessages.length - 1} />
        ))}
      </div>
    </div>
  )
}
