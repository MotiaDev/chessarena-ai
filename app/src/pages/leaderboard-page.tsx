import { LeaderboardItem } from '@/components/leaderboard-item'
import { LeaderboardSkeleton } from '@/components/leaderboard-skeleton'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import type { Leaderboard } from '@/lib/types'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')
  const { data: leaderboard } = useStreamGroup<Leaderboard>({
    groupId: 'global',
    streamName: 'chessLeaderboard',
  })
  const winnersLeaderboard = leaderboard?.sort((a, b) => b.wins - a.wins)

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
          {!winnersLeaderboard || winnersLeaderboard.length === 0 ? (
            <>
              <LeaderboardSkeleton />
              <LeaderboardSkeleton />
              <LeaderboardSkeleton />
            </>
          ) : (
            winnersLeaderboard.map((item, index) => (
              <LeaderboardItem
                key={item.model}
                name={item.model}
                ai={item.provider}
                position={index + 1}
                gamesPlayed={item.gamesPlayed}
                wins={item.wins}
                winRate={(item.wins / item.gamesPlayed) * 100}
              />
            ))
          )}
        </div>
        <div className="flex-1" />
      </div>
    </Page>
  )
}
