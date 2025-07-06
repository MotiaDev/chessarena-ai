import type { Player } from '@/lib/types'
import type React from 'react'
import { AiIcon } from './chess/ai-icon'
import { Card } from './ui/card'
import { formatNumber } from '../lib/utils'

type Props = {
  name: string
  ai: NonNullable<Player['ai']>
  position: number
  gamesPlayed: number
  wins: number
  draws: number
  winRate?: number
  evalRate?: number;
}

export const LeaderboardItem: React.FC<Props> = ({ evalRate = 0, name, ai, position, gamesPlayed, wins, draws, winRate = 0 }) => {
  return (
    <div className="flex flex-col gap-2 w-full text-sm">
      <Card className="flex flex-row gap-2 items-center justify-between w-full p-4">
        <div className="font-bold text-white">{position}</div>
        <div className="flex flex-row gap-2 items-center flex-1">
          <AiIcon ai={ai} />
          <div className="font-semibold text-white/80">{name}</div>
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">G</div>
          <div className="font-bold text-white min-w-[30px]">{formatNumber(gamesPlayed)}</div>
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">W</div>
          <div className="font-bold text-white min-w-[30px]">{formatNumber(wins)}</div>
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">D</div>
          <div className="font-bold text-white min-w-[30px]">{formatNumber(draws)}</div>
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">Eval</div>
          <div className="font-bold text-white min-w-[50px]">{(evalRate).toFixed(1)}</div>
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">W%</div>
          <div className="font-bold text-white min-w-[50px]">{(winRate).toFixed(1)}%</div>
        </div>
      </Card>
    </div>
  )
}
