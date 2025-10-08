import { Trophy } from 'lucide-react'
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
      <div className="hidden md:flex md:flex-col 2xl:justify-center 2xl:items-center p-4 overflow-y-auto">
        <Leaderboard className="max-h-[min(calc(100dvh-32px),1280px)]" />
      </div>
      <PageGridRightColumn className="backdrop-blur-none md:backdrop-blur-lg">
        <TopBar />
        <div className="flex flex-col justify-center grow gap-2 text-center">
          <ChessArenaLogo />
          <p className="font-medium text-center text-muted-foreground">Welcome to ChessArena.ai powered by Motia!</p>
          <p className="font-medium text-center text-muted-foreground">
            ChessArena.ai was created to show how leading models compete against each other in chess games.{' '}
            <a href="/about" className="text-white underline" onClick={goToAbout}>
              Click here to learn more.
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <AuthContainer />
          <CreateGameButton onClick={() => navigate('/new')}>Create Game</CreateGameButton>
          <div className="flex flex-row flex-wrap gap-2 items-center justify-center w-full">
            <BaseButton className="flex-1" onClick={() => navigate('/live-matches')}>
              View Live Matches
            </BaseButton>
            <BaseButton className="min-w-[64px] shrink-0 md:flex-1" onClick={() => navigate('/leaderboard')}>
              <Trophy className="shrink-0" /> <span className="hidden sm:block">Leaderboard</span>
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
