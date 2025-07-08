import { LeaderboardItem } from '@/components/leaderboard-item'
import { LeaderboardSkeleton } from '@/components/leaderboard-skeleton'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { Tab } from '@/components/ui/tab'
import type { Leaderboard } from '@/lib/types'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LeaderboardIllegalMoves } from '../components/leaderboard-illegal-moves'

const winRate = (leaderboard: Leaderboard) => {
  return leaderboard.wins > 0 ? (leaderboard.wins / (leaderboard.gamesPlayed - leaderboard.draws)) * 100 : 0
}

const evalRate = (leaderboard: Leaderboard): number => {
  if (!leaderboard.analysis) return 0;
  
  const { strength, consistency, reliability, trend } = leaderboard.analysis;
  
  // Normalize values to 0-1 range if needed
  const normalizedStrength = (strength + 5) / 10; // Assuming strength ranges from -5 to 5
  const normalizedConsistency = consistency; // Already 0-1
  const normalizedReliability = reliability / 100; // Convert from 0-100 to 0-1
  const normalizedTrend = (trend + 1) / 2; // Assuming trend ranges from -1 to 1

  // Weights for each factor (adjust these based on what's most important)
  const weights = {
    strength: 0.4,      // Raw playing strength
    consistency: 0.3,   // How consistent they are
    reliability: 0.2,   // How often they play strong games
    trend: 0.1          // Whether they're improving
  };

  // Calculate composite score (0-1)
  const score = 
    (normalizedStrength * weights.strength) +
    (normalizedConsistency * weights.consistency) +
    (normalizedReliability * weights.reliability) +
    (normalizedTrend * weights.trend);

  return score;
};
export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')
  const [selectedTab, setSelectedTab] = useState<'wins' | 'illegalMoves'>('wins')
  const { data: leaderboard } = useStreamGroup<Leaderboard>({
    groupId: 'global',
    streamName: 'chessLeaderboard',
  })

  const sortedLeaderboard = leaderboard?.map((leaderboard) => ({
    ...leaderboard,
    evalRate: evalRate(leaderboard),
    winRate: winRate(leaderboard),
  })).sort((a, b) => {
    if (selectedTab === 'wins') {
      // Sort by win rate first, then by evaluation score
      const winRateDiff = b.winRate - a.winRate;
      if (winRateDiff !== 0) return winRateDiff;
      return b.evalRate - a.evalRate;
    } else if (selectedTab === 'illegalMoves') {
      // Sort by fewest illegal moves first, then by evaluation score
      const illegalMovesDiff = a.illegalMoves - b.illegalMoves;
      if (illegalMovesDiff !== 0) return illegalMovesDiff;
      return b.evalRate - a.evalRate;
    } else {
      // Default sort by evaluation score
      return b.evalRate - a.evalRate;
    }
  });

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg">
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
        <div className="relative flex flex-row items-center justify-center w-full">
          <ArrowLeft className="absolute left-0 top-1 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-6 items-center justify-center w-full">
          <div className="text-md font-semibold text-white">Leaderboard</div>

          <div className="flex flex-row gap-2 items-center justify-center">
            <Tab isSelected={selectedTab === 'wins'} onClick={() => setSelectedTab('wins')}>
              Wins
            </Tab>
            <Tab isSelected={selectedTab === 'illegalMoves'} onClick={() => setSelectedTab('illegalMoves')}>
              Illegal Moves
            </Tab>
          </div>

          {!sortedLeaderboard || sortedLeaderboard.length === 0 ? (
            <>
              <LeaderboardSkeleton />
              <LeaderboardSkeleton />
              <LeaderboardSkeleton />
            </>
          ) : selectedTab === 'wins' ? (
            sortedLeaderboard.map((item, index) => (
              <LeaderboardItem
                key={item.model}
                name={item.model}
                ai={item.provider}
                position={index + 1}
                gamesPlayed={item.gamesPlayed}
                wins={item.wins}
                draws={item.draws}
                winRate={item.winRate}
                evalRate={item.evalRate}
              />
            ))
          ) : (
            sortedLeaderboard.map((item, index) => (
              <LeaderboardIllegalMoves
                key={item.model}
                name={item.model}
                ai={item.provider}
                position={index + 1}
                gamesPlayed={item.gamesPlayed}
                illegalMoves={item.illegalMoves}
              />
            ))
          )}
        </div>
        <div className="flex-1" />
      </div>
    </Page>
  )
}
