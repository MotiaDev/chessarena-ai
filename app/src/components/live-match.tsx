import type { Player } from '@/lib/types'
import type React from 'react'
import { AiIcon } from './chess/ai-icon'
import { ChessIcon } from './chess/chess-icon'
import { Card } from './ui/card'

type Props = {
  white: {
    name: string
    ai: NonNullable<Player['ai']>
  }
  black: {
    name: string
    ai: NonNullable<Player['ai']>
  }
  onClick?: () => void
}

export const LiveMatch: React.FC<Props> = ({ white, black, onClick }) => {
  return (
    <Card
      className="flex flex-row gap-2 items-center justify-between w-full px-8 py-6 hover:bg-white/15 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col gap-4 items-start">
        <div className="flex flex-row gap-2 items-center">
          <ChessIcon size={32} color="white" />
          <div className="text-md font-bold text-white">White</div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <AiIcon ai={white.ai} color="white" />
          <div className="text-md font-medium text-white/80">{white.name}</div>
        </div>
      </div>
      <div className="text-md font-semibold text-muted-foreground">vs.</div>
      <div className="flex flex-col gap-4 items-end">
        <div className="flex flex-row gap-2 items-center">
          <div className="text-md font-bold text-white">Black</div>
          <ChessIcon size={32} color="black" />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <div className="text-md font-medium text-white/80">{black.name}</div>
          <AiIcon ai={black.ai} color="white" />
        </div>
      </div>
    </Card>
  )
}
