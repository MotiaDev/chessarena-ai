import { Trophy, FlaskConical, Play } from 'lucide-react'
import { useNavigate } from 'react-router'
import { usePageTitle } from '@/lib/use-page-title'
import { AuthContainer } from '@/components/auth/auth-container'
import { CreateGameButton } from '@/components/chess/create-game/create-game-button'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { TopBar } from '@/components/ui/top-bar'
import { PageGrid, PageGridRightColumn } from '@/components/page-grid'
import { BaseButton } from '@/components/ui/base-button'
import { ChessArenaLogo } from '@/components/ui/chess-arena-logo'

export const LandingPage = () => {
  const navigate = useNavigate()
  const goToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate('/about')
  }

  usePageTitle('Powered by Motia')

  return (
    <PageGrid>
      <div className="hidden md:flex md:flex-col p-4 overflow-y-auto">
        <Leaderboard className="max-h-[min(calc(100dvh-32px),1280px)] my-auto mx-auto" />
      </div>
      <PageGridRightColumn className="backdrop-blur-none md:backdrop-blur-lg">
        <TopBar />
        <div className="flex flex-col justify-center grow gap-2 text-center">
          <ChessArenaLogo />
          <p className="font-medium text-center text-muted-foreground">Welcome to ChessArena.ai powered by Motia!</p>
          <p className="font-medium text-center text-muted-foreground">
            ChessArena.ai benchmarks LLM chess reasoning with transparent, reproducible evaluation.{' '}
            <a href="/methodology" className="text-white underline" onClick={(e) => { e.preventDefault(); navigate('/methodology') }}>
              See our methodology.
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <AuthContainer />
          <CreateGameButton onClick={() => navigate('/new')}>Create Game</CreateGameButton>
          <div className="grid grid-cols-3 gap-2 w-full">
            <BaseButton className="col-span-3 sm:col-span-1" onClick={() => navigate('/live-matches')}>
              <Play size={18} className="shrink-0" />
              <span>Live</span>
            </BaseButton>
            <BaseButton className="col-span-3 sm:col-span-1" onClick={() => navigate('/leaderboard')}>
              <Trophy size={18} className="shrink-0" />
              <span>Leaderboard</span>
            </BaseButton>
            <BaseButton className="col-span-3 sm:col-span-1" onClick={() => navigate('/methodology')}>
              <FlaskConical size={18} className="shrink-0" />
              <span>Methodology</span>
            </BaseButton>
          </div>

          <p className="font-medium text-sm text-center text-muted-foreground">
            This project is open-source, click{' '}
            <a href="/about" className="text-white underline" onClick={goToAbout}>
              here
            </a>{' '}
            to read more about the project.
          </p>
        </div>
      </PageGridRightColumn>
    </PageGrid>
  )
}
