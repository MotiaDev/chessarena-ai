import type { GameMessage } from '@chessarena/types/game-message'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ChessSidechatMessage } from './chess-sidechat-message'

type Props = { gameId: string }

export const ChessSidechat: React.FC<Props> = ({ gameId }) => {
  const { data: sidechatMessages } = useStreamGroup<GameMessage>({
    streamName: 'chessSidechatMessage',
    groupId: gameId,
  })

  return (
    <div className="flex flex-col gap-2 w-full">
      {sidechatMessages.map((message, index) => (
        <ChessSidechatMessage key={message.id} message={message} isLast={index === sidechatMessages.length - 1} />
      ))}
    </div>
  )
}
