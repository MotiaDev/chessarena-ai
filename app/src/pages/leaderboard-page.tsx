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
  return (leaderboard.wins / (leaderboard.gamesPlayed - leaderboard.draws)) * 100
}

export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')
  const [selectedTab, setSelectedTab] = useState<'wins' | 'illegalMoves'>('wins')
  const { data: leaderboard } = useStreamGroup<Leaderboard>({
    groupId: 'global',
    streamName: 'chessLeaderboard',
  })

  const sortedLeaderboard =
    selectedTab === 'wins'
      ? leaderboard?.sort((a, b) => winRate(b) - winRate(a))
      : leaderboard?.sort((a, b) => b.illegalMoves - a.illegalMoves)

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
                winRate={winRate(item)}
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
