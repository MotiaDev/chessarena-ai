import { LeaderboardItem } from '@/components/leaderboard-item'
import { LeaderboardSkeleton } from '@/components/leaderboard-skeleton'
import { PageDialog } from '@/components/page-dialog'
import { Tab } from '@/components/ui/tab'
import type { Leaderboard } from '@chessarena/types/leaderboard'
import { usePageTitle } from '@/lib/use-page-title'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')
  const [selectedTab, setSelectedTab] = useState<string>('wins')
  const { data: leaderboard } = useStreamGroup<Leaderboard>({
    groupId: 'global',
    streamName: 'chessLeaderboard',
  })

  usePageTitle('Leaderboard')

  const sortedLeaderboard = useMemo(() => {
    if (selectedTab === 'wins') {
      return leaderboard?.sort((a, b) => b.victories - a.victories)
    }
    if (selectedTab === 'checkmates') {
      return leaderboard?.sort((a, b) => b.checkmates - a.checkmates)
    }
    if (selectedTab === 'illegalMoves') {
      return leaderboard?.sort((a, b) => {
        const aIllegalMoves = a.illegalMoves / a.gamesPlayed
        const bIllegalMoves = b.illegalMoves / b.gamesPlayed

        return aIllegalMoves - bIllegalMoves
      })
    }
    if (selectedTab === 'score') {
      return leaderboard?.sort((a, b) => {
        const aScore = a.sumCentipawnScores / a.gamesPlayed
        const bScore = b.sumCentipawnScores / b.gamesPlayed

        return bScore - aScore
      })
    }
    if (selectedTab === 'swing') {
      return leaderboard?.sort((a, b) => {
        const aSwing = a.sumHighestSwing / a.gamesPlayed
        const bSwing = b.sumHighestSwing / b.gamesPlayed

        return bSwing - aSwing
      })
    }
    return leaderboard
  }, [leaderboard, selectedTab])

  return (
    <PageDialog>
      <div className="relative flex flex-row items-center justify-center w-full m-6">
        <ArrowLeft className="absolute left-6 top-0 size-6 cursor-pointer" onClick={onBack} />
        <h1 className="text-lg font-semibold text-white">Leaderboard</h1>
      </div>

      <div className="flex flex-row gap-2 items-center md:justify-center px-6 border-b border-white/10 w-full max-w-screen overflow-x-auto">
        <Tab isSelected={selectedTab === 'wins'} onClick={() => setSelectedTab('wins')}>
          Wins
        </Tab>
        <Tab isSelected={selectedTab === 'score'} onClick={() => setSelectedTab('score')}>
          Score
        </Tab>
        <Tab isSelected={selectedTab === 'swing'} onClick={() => setSelectedTab('swing')}>
          Swings
        </Tab>
        <Tab isSelected={selectedTab === 'illegalMoves'} onClick={() => setSelectedTab('illegalMoves')}>
          Illegal Moves
        </Tab>
        <Tab isSelected={selectedTab === 'checkmates'} onClick={() => setSelectedTab('checkmates')}>
          Checkmates
        </Tab>
      </div>

      <div className="flex flex-col gap-6 items-center justify-center max-w-screen w-full p-6 overflow-x-auto">
        {!sortedLeaderboard || sortedLeaderboard.length === 0 ? (
          <>
            <LeaderboardSkeleton />
            <LeaderboardSkeleton />
            <LeaderboardSkeleton />
          </>
        ) : (
          sortedLeaderboard.map((item, index) => (
            <LeaderboardItem key={item.model} leaderboard={item} position={index + 1} tab={selectedTab} />
          ))
        )}
      </div>
    </PageDialog>
  )
}
