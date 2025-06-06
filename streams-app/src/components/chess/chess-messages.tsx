import { useStreamGroup, useStreamItem } from '@motiadev/stream-client-react'
import { useEffect, useRef, useState } from 'react'
import { ChessMessage } from './chess-message'
import type { Game, Message, Players } from './types'

type Props = { gameId: string }

export const ChessMessages: React.FC<Props> = ({ gameId }) => {
  const { data: game } = useStreamItem<Game>({ streamName: 'chessGame', groupId: 'game', id: gameId })
  const { data: messages } = useStreamGroup<Message>({
    streamName: 'chessGameMessage',
    groupId: `${gameId}-messages`,
  })
  const [players, setPlayers] = useState<Players>()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!game) {
      return
    }

    setPlayers(game?.players)
  }, [game?.id])

  return (
    <div className="flex flex-col gap-4 py-2 overflow-y-auto" ref={ref}>
      {messages.map((message, index) => (
        <ChessMessage
          parentRef={ref}
          key={message.id}
          message={message}
          players={players}
          isLast={index === messages.length - 1}
        />
      ))}
    </div>
  )
}
