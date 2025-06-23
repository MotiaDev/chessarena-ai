import { MotiaPowered } from '@/components/motia-powered'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import type { Game } from '@/lib/types'
import { useDeviceWidth } from '@/lib/use-device-width'
import { useGetGame } from '@/lib/use-get-game'
import { useStreamItem } from '@motiadev/stream-client-react'
import { ArrowLeft } from 'lucide-react'
import { ChessBoard } from './chess-board'
import { ChessChatInput } from './chess-chat-input'
import { ChessLastGameMove } from './chess-last-game-move'
import { ChessMessages } from './chess-messages'
import { ChessShare } from './chess-share'

type Props = {
  gameId: string
  password?: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, password, onClose }) => {
  const gameWithRole = useGetGame(gameId, password)
  const { data: game } = useStreamItem<Game>({
    streamName: 'chessGame',
    groupId: 'game',
    id: gameId,
  })
  const isMobile = useDeviceWidth() < 768

  if (!game || !gameWithRole) {
    return null
  }

  return (
    <div className="flex flex-col items-center mx-auto w-screen h-screen justify-between">
      <div className="flex md:flex-row max-md:flex-col items-center justify-between w-full h-screen max-h-screen">
        <header className="md:hidden flex flex-row gap-2 items-center justify-between px-4 pt-4 w-full md:border-b-2 md:border-white/5">
          <Button variant="default" className="h-12 w-12" onClick={onClose}>
            <ArrowLeft className="size-5" />
          </Button>
          <MotiaPowered size="sm" />
          <div className="flex flex-row gap-2 items-center justify-end">
            <ChessShare game={gameWithRole} />
          </div>
        </header>

        <div className="flex-1 w-full h-full flex items-center justify-center p-8">
          <div className="w-full h-full flex items-center justify-center">
            <ChessBoard game={game} password={password} role={gameWithRole.role} />
          </div>
        </div>

        {isMobile ? (
          <>
            <Panel>
              <ChessLastGameMove game={game} />
            </Panel>
            <Panel
              className="
              flex flex-col flex-1 gap-4 items-center justify-between w-screen
              overflow-y-auto py-4
            "
            >
              <div className="px-4 flex flex-col flex-1 w-full overflow-y-auto">
                <ChessMessages gameId={gameId} />
              </div>
            </Panel>
            <Panel className="p-4 w-full">
              <ChessChatInput game={gameWithRole} />
            </Panel>
          </>
        ) : (
          <Panel
            className="
              flex flex-col flex-1 gap-4 items-center justify-between w-screen h-screen
              h-screen min-w-[400px] max-w-[500px] border-l-2 border-white/5
            "
          >
            <header className="max-md:hidden flex flex-row gap-2 items-center justify-between p-6 w-full md:border-b-2 md:border-white/5">
              <Button variant="default" className="h-12 w-12" onClick={onClose}>
                <ArrowLeft className="size-5" />
              </Button>

              <MotiaPowered size="sm" />

              <ChessShare game={gameWithRole} />
            </header>

            <ChessLastGameMove game={game} />

            <div className="px-4 flex flex-col flex-1 w-full overflow-y-auto">
              <ChessMessages gameId={gameId} />
            </div>
            <div className="pb-4 px-4 w-full">
              <ChessChatInput game={gameWithRole} />
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}
