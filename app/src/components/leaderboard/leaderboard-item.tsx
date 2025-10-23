import { formatNumber } from '@/lib/utils'
import type { Leaderboard } from '@chessarena/types/leaderboard'
import type React from 'react'

type Props = {
  leaderboard: Leaderboard
}

const LeaderboardRow = ({ value }: { value: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-1 items-center w-[120px] max-w-[120px] min-w-[120px] text-center">
      <div className="font-bold text-white">{value}</div>
    </div>
  )
}

export const LeaderboardItem: React.FC<Props> = ({ leaderboard }) => {
  const winRate = leaderboard.victories > 0 ? (leaderboard.victories / leaderboard.gamesPlayed) * 100 : 0
  const centipawnScore = leaderboard.sumCentipawnScores / leaderboard.gamesPlayed
  const swing = leaderboard.sumHighestSwing / leaderboard.gamesPlayed
  const illegalMoves = leaderboard.illegalMoves / leaderboard.gamesPlayed

  return (
    <div className="flex flex-col gap-2 w-full text-sm h-[52px]">
      <div className="flex flex-row gap-2 items-center justify-between py-4">
        <LeaderboardRow value={formatNumber(leaderboard.victories)} />
        <LeaderboardRow value={`${winRate.toFixed(1)}%`} />
        <LeaderboardRow value={formatNumber(leaderboard.checkmates)} />
        <LeaderboardRow value={formatNumber(leaderboard.draws)} />
        <LeaderboardRow value={formatNumber(leaderboard.gamesPlayed)} />
        <LeaderboardRow value={centipawnScore.toFixed(0)} />
        <LeaderboardRow value={`${illegalMoves.toFixed(0)}`} />
        <LeaderboardRow value={swing.toFixed(0)} />
      </div>
    </div>
  )
}
