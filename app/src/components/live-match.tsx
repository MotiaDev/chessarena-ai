import type { LiveAiPlayer } from '@chessarena/types/live-ai-games'
import type React from 'react'
import { AiIcon } from './chess/ai-icon'
import { ChessIcon } from './chess/chess-icon'
import { Card } from './ui/card'

type Props = {
  white: LiveAiPlayer
  black: LiveAiPlayer
  onClick?: () => void
}

export const LiveMatch: React.FC<Props> = ({ white, black, onClick }) => {
  return (
    <Card
      className="flex flex-row gap-2 items-center justify-between w-full px-8 py-6 bg-white/10 hover:bg-white/15 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col gap-4 items-start">
        <div className="flex flex-row gap-2 items-center">
          <ChessIcon size={32} color="white" />
          <div className="text-md font-bold text-white capitalize">{white.provider}</div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <AiIcon ai={white.provider} color="white" />
          <div className="text-sm font-bold text-white/70 ellipsis-1">{white.model}</div>
        </div>
      </div>
      <div className="text-md font-semibold text-muted-foreground">vs.</div>
      <div className="flex flex-col gap-4 items-end">
        <div className="flex flex-row gap-2 items-center">
          <div className="text-md font-bold text-white capitalize">{black.provider}</div>
          <ChessIcon size={32} color="black" style={{ stroke: '#fff', strokeWidth: 1 }} />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <div className="text-sm font-bold text-white/70 ellipsis-1">{black.model}</div>
          <AiIcon ai={black.provider} color="white" />
        </div>
      </div>
    </Card>
  )
}
