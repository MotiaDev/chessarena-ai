import type { GameMessage } from '@chessarena/types/game-message'
import type { Game } from '@chessarena/types/game'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ChessMessage } from './chess-message'

type Props = { gameId: string; game: Game }

export const ChessMessages: React.FC<Props> = ({ gameId, game }) => {
  const { data: gameMessages } = useStreamGroup<GameMessage>({
    streamName: 'chessGameMessage',
    groupId: gameId,
  })

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full">
      <div className="flex flex-1 flex-col gap-2 w-full">
        {gameMessages.map((message, index) => (
          <ChessMessage
            key={message.id || index}
            message={message}
            game={game}
            isLast={index === gameMessages.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
