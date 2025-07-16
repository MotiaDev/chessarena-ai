import type { Leaderboard } from '@/lib/types'
import type React from 'react'
import { formatNumber } from '../lib/utils'
import { AiIcon } from './chess/ai-icon'

type Props = {
  position: number
  leaderboard: Leaderboard
}

const LeaderboardRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-1 items-center w-[120px] max-w-[120px] min-w-[120px] text-center">
      <div className="font-semibold text-white/60">{label}</div>
      <div className="font-bold text-white">{value}</div>
    </div>
  )
}

export const LeaderboardItem: React.FC<Props> = ({ position, leaderboard }) => {
  const winRate =
    leaderboard.victories > 0 ? (leaderboard.victories / (leaderboard.gamesPlayed - leaderboard.draws)) * 100 : 0
  const score = leaderboard.sumCentipawnScores / leaderboard.gamesPlayed
  const swing = leaderboard.sumHighestSwing / leaderboard.gamesPlayed
  const illegalMoves = leaderboard.illegalMoves / leaderboard.gamesPlayed

  return (
    <div className="flex flex-col gap-2 w-full text-sm">
      <div className="flex flex-row gap-2 items-center justify-between py-4">
        <div className="font-bold text-white w-[40px] min-w-[40px] max-w-[40px] text-center">{position}</div>
        <div className="flex flex-row gap-2 items-center flex-1 w-[250px] min-w-[250px] max-w-[250px]">
          <div className="bg-white rounded-full p-1">
            <AiIcon ai={leaderboard.provider} color="black" />
          </div>
          <div className="flex flex-col gap-1 items-start">
            <div className="font-semibold text-white">{leaderboard.provider}</div>
            <div className="font-semibold text-white/60">{leaderboard.model}</div>
          </div>
        </div>
        <LeaderboardRow label="Matches" value={formatNumber(leaderboard.gamesPlayed)} />
        <LeaderboardRow label="Victories" value={formatNumber(leaderboard.victories)} />
        <LeaderboardRow label="Checkmates" value={formatNumber(leaderboard.checkmates)} />
        <LeaderboardRow label="Draws" value={formatNumber(leaderboard.draws)} />
        <LeaderboardRow label="Win %" value={`${winRate.toFixed(1)}%`} />
        <LeaderboardRow label="Avg. Score" value={score.toFixed(0)} />
        <LeaderboardRow label="Avg. Illegal Moves" value={`${illegalMoves.toFixed(0)}`} />
        <LeaderboardRow label="Avg. Swing" value={swing.toFixed(0)} />
      </div>
    </div>
  )
}
