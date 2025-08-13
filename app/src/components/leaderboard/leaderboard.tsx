import { AiIcon } from '@/components/chess/ai-icon'
import type { Leaderboard as LeaderboardType } from '@chessarena/types/leaderboard'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { LeaderboardItem } from './leaderboard-item'
import { LeaderboardSkeleton } from './leaderboard-skeleton'

const HeaderRow: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex flex-col gap-1 items-center w-[120px] max-w-[120px] min-w-[120px] text-center">
      <div className="font-semibold text-white/60">{label}</div>
    </div>
  )
}

export const Leaderboard: React.FC = () => {
  const { data: leaderboard } = useStreamGroup<LeaderboardType>({
    groupId: 'global',
    streamName: 'chessLeaderboard',
  })

  return (
    <div className="border-t border-white/10 flex flex-col gap-6 items-center justify-center max-w-screen w-full overflow-x-auto h-full">
      {!leaderboard || leaderboard.length === 0 ? (
        <>
          <LeaderboardSkeleton />
          <LeaderboardSkeleton />
          <LeaderboardSkeleton />
        </>
      ) : (
        <div className="flex flex-row w-full h-full items-center justify-center h-full">
          <div className="border-r border-white/10 flex flex-col gap-6 pt-[80px] h-full pb-4">
            {leaderboard.map((leaderboard, position) => (
              <div className="flex flex-row gap-2 items-center flex-1 w-[250px] min-w-[250px] max-w-[250px] max-h-[52px] h-[52px]">
                <div className="font-bold text-white w-[40px] min-w-[40px] max-w-[40px] text-center">
                  {position + 1}
                </div>
                <div className="bg-white rounded-full p-1">
                  <AiIcon ai={leaderboard.provider} color="black" />
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <div className="font-semibold text-white">{leaderboard.provider}</div>
                  <div className="font-semibold text-white/60 ellipsis-1">{leaderboard.model}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col overflow-x-auto h-full">
            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-2 items-center justify-between py-4">
                <HeaderRow label="Matches" />
                <HeaderRow label="Wins" />
                <HeaderRow label="Checkmates" />
                <HeaderRow label="Draws" />
                <HeaderRow label="Win %" />
                <HeaderRow label="Avg. Score" />
                <HeaderRow label="Avg. Illegal Moves" />
                <HeaderRow label="Avg. Swing" />
              </div>
            </div>
            <div className="flex flex-col gap-6 pb-4">
              {leaderboard.map((item) => (
                <LeaderboardItem key={item.model} leaderboard={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
