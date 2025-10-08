import { LiveMatch } from '@/components/live-match'
import { PageGrid, PageGridRightColumn } from '@/components/page-grid'
import { BaseButton } from '@/components/ui/base-button'
import { TopBar } from '@/components/ui/top-bar'
import { usePageTitle } from '@/lib/use-page-title'
import type { LiveAiGames } from '@chessarena/types/live-ai-games'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { useNavigate } from 'react-router'

export const LiveMatchesPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')
  const { data: liveAiGames } = useStreamGroup<LiveAiGames>({ streamName: 'chessLiveAiGames', groupId: 'game' })

  usePageTitle('Live Matches')

  return (
    <PageGrid>
      <PageGridRightColumn>
        <TopBar onBack={onBack} />
        <div className="overflow-y-auto flex flex-col gap-4 w-full h-full">
          <div className="flex-1" />
          <div className="text-lg font-bold text-white text-center">Live Matches</div>

          {liveAiGames.map((game) => (
            <LiveMatch
              key={game.id}
              white={game.players.white}
              black={game.players.black}
              onClick={() => navigate(`/game/${game.id}`)}
            />
          ))}
          {liveAiGames.length === 0 && (
            <>
              <div className="text-white/50 text-center">
                Currently there are no live matches going on. Click the button below to create a new game.
              </div>
              <BaseButton onClick={() => navigate('/new')}>Create Game</BaseButton>
            </>
          )}
          <div className="flex-1" />
        </div>
      </PageGridRightColumn>
    </PageGrid>
  )
}
