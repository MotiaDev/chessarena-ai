import { MotiaPowered } from '@/components/motia-powered'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Panel } from '@/components/ui/panel'
import type { Game } from '@/lib/types'
import { useDeviceWidth } from '@/lib/use-device-width'
import { useGetGame } from '@/lib/use-get-game'
import { cn } from '@/lib/utils'
import { useStreamItem } from '@motiadev/stream-client-react'
import { ArrowLeft, ChevronRight, Loader2, MessageCircle, MessagesSquare, Workflow } from 'lucide-react'
import { useState } from 'react'
import { ChessBoard } from './chess-board'
import { ChessChatInput } from './chess-chat-input'
import { ChessLastGameMove } from './chess-last-game-move'
import { ChessMessages } from './chess-messages'
import { ChessShare } from './chess-share'
import { ChessSidechat } from './chess-sidechat'
import Scoreboard from './scoreboard/game-scoreboard'
import { Tab } from '../ui/tab'

type Props = {
  gameId: string
  password?: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, password, onClose }) => {
  const isMobile = useDeviceWidth() < 768
  const [isSidechatOpen, setIsSidechatOpen] = useState(!isMobile)
  const gameWithRole = useGetGame(gameId, password)
  const { data: game } = useStreamItem<Game>({
    streamName: 'chessGame',
    groupId: 'game',
    id: gameId,
  })

  if (!game) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  const role = gameWithRole?.role ?? 'spectator'
  const isSpectator = role === 'spectator'

  return (
    <div className="flex flex-col items-center mx-auto w-screen h-screen justify-between">
      <div className="flex md:flex-row max-md:flex-col items-center justify-between w-full h-screen max-h-screen">
        <header className="md:hidden flex flex-row gap-2 items-center justify-between p-4 w-full md:border-b-2 md:border-white/5">
          <Button variant="default" className="h-12 w-12" onClick={onClose}>
            <ArrowLeft className="size-5" />
          </Button>
          <MotiaPowered size="sm" />
          <div className="flex flex-row gap-2 items-center justify-end">
            <ChessShare game={gameWithRole ?? game} />
          </div>
        </header>

        {!isMobile && (
          <Panel
            className="
            flex flex-col flex-1 gap-4 items-center justify-between w-screen
            h-screen min-w-[400px] max-w-[400px] border-l-2 border-white/5
          "
          >
            <header className="max-md:hidden flex flex-row gap-2 items-center justify-between p-6 w-full md:border-b-2 md:border-white/5">
              <Button variant="default" className="h-12 w-12" onClick={onClose}>
                <ArrowLeft className="size-5" />
              </Button>

              <MotiaPowered size="sm" />

              <ChessShare game={gameWithRole ?? game} />
            </header>

            {game.status === 'pending' && (
              <div className="px-4 w-full border-b-2 border-white/5 pb-4 max-md:pt-4">
                <ChessLastGameMove game={game} />
              </div>
            )}

            <div className={cn('px-4 flex flex-col flex-1 w-full overflow-y-auto', isSpectator && 'pb-4')}>
              <ChessMessages gameId={gameId} />
              {['completed', 'draw'].includes(game.status) && <Scoreboard game={game} />}
            </div>
            {!isSpectator && gameWithRole && (
              <div className="pb-4 px-4 w-full">
                <ChessChatInput game={gameWithRole} />
              </div>
            )}
          </Panel>
        )}

        <div className="flex-1 w-full h-full flex items-center justify-center md:p-4">
          <div
            className={cn('w-full h-full flex items-center justify-center', isSidechatOpen && 'md:w-[calc(100%-20px)]')}
          >
            <ChessBoard game={game} password={password} role={role} />
          </div>
        </div>

        {isMobile ? (
          <>
            <Panel className="p-0">
              <div className="flex flex-col gap-4 px-4 w-full border-b-2 border-white/5 max-md:pt-4">
                {game.status === 'pending' && <ChessLastGameMove game={game} />}
                <div className="flex flex-row gap-2 items-center justify-center">
                  <Tab isSelected={!isSidechatOpen} onClick={() => setIsSidechatOpen(false)}>
                    <Workflow className="size-4" />
                    Gameplay
                  </Tab>
                  <Tab isSelected={isSidechatOpen} onClick={() => setIsSidechatOpen(true)}>
                    <MessageCircle className="size-4" />
                    Sidechat
                  </Tab>
                </div>
              </div>
            </Panel>
            <Panel
              className="
              flex flex-col flex-1 gap-4 items-center justify-between w-screen
              overflow-y-auto p-4
            "
            >
              {isSidechatOpen ? <ChessSidechat gameId={gameId} /> : <ChessMessages gameId={gameId} />}
              {['completed', 'draw'].includes(game.status) && <Scoreboard game={game} />}
            </Panel>
            {(isSidechatOpen || !isSpectator) && gameWithRole && (
              <Panel className="p-4 w-full">
                <ChessChatInput game={gameWithRole} />
              </Panel>
            )}
          </>
        ) : isSidechatOpen ? (
          <Panel
            className="
              flex flex-col flex-1 gap-4 items-center justify-between w-screen h-screen
              h-screen min-w-[300px] max-w-[400px] border-l-2 border-white/5
            "
          >
            <header className="border-b-2 border-white/5 w-full p-4">
              <Button
                variant="default"
                className="h-12 w-12 absolute top-[16px] left-[16px]"
                onClick={() => setIsSidechatOpen(false)}
              >
                <ChevronRight className="size-6" />
              </Button>

              <div className="flex flex-col gap-0 items-center justify-center text-lg font-bold">
                <div className="text-lg font-bold">Sidechat</div>
                <div className="text-sm text-muted-foreground">Chat with other spectators</div>
              </div>
            </header>
            <div className="px-4 flex flex-col flex-1 w-full overflow-y-auto">
              <ChessSidechat gameId={gameId} />
            </div>
            {isSpectator && gameWithRole && (
              <div className="pb-4 px-4 w-full">
                <ChessChatInput game={gameWithRole} />
              </div>
            )}
          </Panel>
        ) : (
          <Card
            className="flex flex-row gap-2 items-center z-50 cursor-pointer bg-black/40 hover:bg-white/10 transition-colors text-white fixed top-6 right-6 backdrop-blur-lg"
            onClick={() => setIsSidechatOpen(!isSidechatOpen)}
          >
            <MessagesSquare />
          </Card>
        )}
      </div>
    </div>
  )
}
