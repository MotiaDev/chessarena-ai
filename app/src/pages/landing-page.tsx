import { AuthContainer } from '@/components/auth/auth-container'
import { CreateGameButton } from '@/components/chess/create-game/create-game-button'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { MotiaPowered } from '@/components/motia-powered'
import { BaseButton } from '@/components/ui/base-button'
import { usePageTitle } from '@/lib/use-page-title'
import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router'

export const LandingPage = () => {
  const navigate = useNavigate()
  const goToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate('/about')
  }

  usePageTitle('Powered by Motia')

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_minmax(min-content,200px)] w-screen h-dvh bg-image-landing">
      <div className="hidden lg:flex lg:flex-col md:items-center md:justify-center p-4">
        <div className="w-full md:border-l-2 rounded-lg border border-white/5 backdrop-blur-lg">
          <Leaderboard />
        </div>
      </div>
      <div className="flex flex-col w-full p-6 gap-4 items-center justify-between col-start-2 md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg overflow-y-auto">
        <MotiaPowered />
        <div className="flex flex-col gap-2 items-center justify-center">
          <img src="/horse.png" alt="Chessarena.ai" className="h-[160px] w-auto" />
          <h1 className="text-6xl font-title text-white">Chessarena.ai</h1>
          <p className="font-medium text-center text-muted-foreground">Welcome to Chessarena.ai powered by Motia!</p>
          <p className="font-medium text-center text-muted-foreground">
            Chessarena.ai was created to show how leading models compete against each other in chess games.{' '}
            <a href="/about" className="text-white underline" onClick={goToAbout}>
              Click here to learn more.
            </a>
          </p>
        </div>

        <AuthContainer />

        <div className="flex flex-col gap-6 items-center justify-center w-full">
          <CreateGameButton onClick={() => navigate('/new')}>Create Game</CreateGameButton>
          <div className="flex flex-row gap-2 items-center justify-center w-full">
            <BaseButton className="w-full flex-1" onClick={() => navigate('/live-matches')}>
              View live matches
            </BaseButton>
            <BaseButton onClick={() => navigate('/leaderboard')}>
              <Trophy /> Leaderboard
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
      </div>
    </div>
  )
}
