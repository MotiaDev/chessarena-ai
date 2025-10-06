import { MotiaPowered } from '@/components/motia-powered'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Panel } from '@/components/ui/panel'
import { useAuth } from '@/lib/auth/use-auth'
import { useDeviceWidth } from '@/lib/use-device-width'
import { useGetGame } from '@/lib/use-get-game'
import { cn } from '@/lib/utils'
import type { Game } from '@chessarena/types/game'
import { useStreamItem } from '@motiadev/stream-client-react'
import { ArrowLeft, ChevronRight, Loader2, MessageCircle, MessagesSquare, Workflow } from 'lucide-react'
import { useState } from 'react'
import { Tab } from '../ui/tab'
import { ChessAccessRequest } from './access/chess-access-request'
import { ChessRequestAccess } from './access/chess-request-access'
import { ChessBoard } from './chess-board'
import { ChessChatInput } from './chess-chat-input'
import { ChessLastGameMove } from './chess-last-game-move'
import { ChessMessages } from './chess-messages'
import { ChessShare } from './chess-share'
import { ChessSidechat } from './chess-sidechat'
import Scoreboard from './scoreboard/game-scoreboard'

type Props = {
  gameId: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, onClose }) => {
  const isMobile = useDeviceWidth() < 1280
  const [isSidechatOpen, setIsSidechatOpen] = useState(!isMobile)
  const { user } = useAuth()
  const { data: game, event } = useStreamItem<Game>({
    streamName: 'chessGame',
    groupId: 'game',
    id: gameId,
  })
  const { game: gameWithRole, accessRequest, onCancel } = useGetGame(gameId, event)

  if (!game) {
    return (
      <div className="w-screen h-dvh flex items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  const role = gameWithRole?.role ?? 'spectator'
  const isSpectator = role === 'spectator'

  const isBlackAssigned = !!game.players.black.userId || !!game.players.black.ai
  const isUserOwner = game.players.white.userId === user?.id

  const messagesComponent = (
    <>
      <ChessMessages gameId={gameId} />
      {['completed', 'draw'].includes(game.status) && <Scoreboard game={game} />}
      {!isBlackAssigned && !isUserOwner && <ChessRequestAccess gameId={gameId} />}
      {isUserOwner &&
        accessRequest.map((accessRequest, index) => (
          <ChessAccessRequest
            key={index}
            user={accessRequest.user}
            gameId={gameId}
            onCancel={() => onCancel(accessRequest.user.id)}
          />
        ))}
    </>
  )

  return (
    <div className="flex flex-col items-center mx-auto w-full flex-1 justify-between">
      <div className="flex flex-col xl:flex-row items-center justify-between w-full h-dvh overflow-y-auto overflow-x-hidden">
        <header className="xl:hidden flex flex-row gap-2 items-center justify-between p-2 xl:p-4 w-full xl:border-b-2 xl:border-white/5">
          <Button variant="default" className="h-8 w-8 xl:h-12 xl:w-12" onClick={onClose}>
            <ArrowLeft className="size-4" />
          </Button>
          <MotiaPowered size="sm" githubLogo />
          <div className="flex flex-row gap-2 items-center justify-end">
            <ChessShare />
          </div>
        </header>

        {!isMobile && (
          <Panel
            className={cn(
              'flex flex-col flex-1 gap-4 items-center justify-between w-full',
              'h-dvh min-w-[300px] max-w-[400px] border-l-2 border-white/5',
            )}
          >
            <header className="hidden xl:flex flex-row gap-2 items-center justify-between p-6 w-full xl:border-b-2 xl:border-white/5">
              <Button variant="default" className="h-12 w-12" onClick={onClose}>
                <ArrowLeft className="size-5" />
              </Button>

              <MotiaPowered size="sm" githubLogo />
              <ChessShare />
            </header>

            {game.status === 'pending' && (
              <div className="px-4 w-full border-b-2 border-white/5 pb-4 pt-4 xl:pt-0">
                <ChessLastGameMove game={game} />
              </div>
            )}

            <div className={cn('px-4 flex flex-col flex-1 w-full overflow-y-auto', isSpectator && 'pb-4')}>
              {messagesComponent}
            </div>
            {!isSpectator && gameWithRole && (
              <div className="pb-4 px-4 w-full">
                <ChessChatInput game={gameWithRole} />
              </div>
            )}
          </Panel>
        )}

        <div className="flex-1 w-full xl:p-4 2xl:p-8">
          <ChessBoard game={game} role={role} />
        </div>

        {isMobile ? (
          <>
            <Panel className="p-0">
              <div className="flex flex-col gap-2 px-2 w-full border-b-2 border-white/5 pt-2 xl:pt-0">
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
            <Panel className="min-h-[200px] flex flex-col flex-1 gap-4 items-center justify-between w-full overflow-y-auto p-4">
              {isSidechatOpen ? <ChessSidechat gameId={gameId} /> : messagesComponent}
            </Panel>
            {(isSidechatOpen || !isSpectator) && gameWithRole && (
              <Panel className="p-2 w-full">
                <ChessChatInput game={gameWithRole} />
              </Panel>
            )}
          </>
        ) : isSidechatOpen ? (
          <Panel
            className={cn(
              'flex flex-col flex-1 gap-4 items-center justify-between w-full',
              'min-h-[200px] h-dvh min-w-[300px] max-w-[400px] border-l-2 border-white/5',
            )}
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
