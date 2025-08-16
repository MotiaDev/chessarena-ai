import { LiveMatch } from '@/components/live-match'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { BaseButton } from '@/components/ui/base-button'
import { usePageTitle } from '@/lib/use-page-title'
import type { LiveAiGames } from '@chessarena/types/live-ai-games'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

export const LiveMatchesPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')
  const { data: liveAiGames } = useStreamGroup<LiveAiGames>({ streamName: 'chessLiveAiGames', groupId: 'game' })

  usePageTitle('Live Matches')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg">
      <div className="relative flex flex-row items-center justify-center w-full">
        <ArrowLeft className="absolute left-0 top-1 size-6 cursor-pointer" onClick={onBack} />
        <MotiaPowered size="sm" />
      </div>
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
    </Page>
  )
}
