import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { AiIcon } from '@/components/chess/ai-icon'
import type { Leaderboard as LeaderboardType } from '@chessarena/types/leaderboard'
import { LeaderboardItem } from './leaderboard-item'
import { LeaderboardSkeleton } from './leaderboard-skeleton'

const HeaderRow: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex flex-col gap-1 items-center w-[120px] max-w-[120px] min-w-[120px] text-center">
      <div className="font-semibold text-white/60">{label}</div>
    </div>
  )
}

type Props = {
  showBackButton?: boolean
}

export const Leaderboard: React.FC<Props> = ({ showBackButton = false }) => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  const { data: leaderboard } = useStreamGroup<LeaderboardType>({
    groupId: 'global',
    streamName: 'chessLeaderboard',
  })

  return (
    <div className="flex flex-col grow max-h-full bg-white/5 backdrop-blur-lg md:rounded-lg md:border-2 md:border-white/5">
      <div className="flex flex-row items-center w-full p-4 border-b border-white/10">
        {showBackButton && <ArrowLeft className="shrink-0 size-6 cursor-pointer" onClick={onBack} />}
        <h1 className="grow mr-6 text-center text-lg font-semibold text-white">Leaderboard</h1>
      </div>
      <div className="flex flex-col grow gap-6 w-full overflow-y-auto">
        {!leaderboard || leaderboard.length === 0 ? (
          <>
            <LeaderboardSkeleton />
            <LeaderboardSkeleton />
            <LeaderboardSkeleton />
          </>
        ) : (
          <div className="flex flex-row grow">
            <div className="border-r border-white/10 flex flex-col gap-6 pt-20 h-full pb-4">
              {leaderboard.map((leaderboard, position) => (
                <div key={position} className="flex flex-row gap-2 items-center w-[230px] h-[52px]">
                  <div className="font-bold text-white w-[40px] text-center">{position + 1}</div>
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
            <div className="flex flex-col overflow-x-auto h-full grow">
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
    </div>
  )
}
