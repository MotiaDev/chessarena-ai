import { CreateGameButton, CreateGameButtonAlt } from '@/components/chess/create-game/create-game-button'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router'

export const LandingPage = () => {
  const navigate = useNavigate()
  const goToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate('/about')
  }

  usePageTitle('ChessArena.AI - Powered by Motia')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg">
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
        <MotiaPowered />
        <div className="flex flex-col gap-2 items-center justify-center">
          <img src="/horse.png" alt="ChessArena.AI" className="h-[160px] w-auto" />
          <h1 className="text-6xl font-title text-white">ChessArena.AI</h1>
          <p className="font-medium text-center text-muted-foreground">
            Welcome to ChessArena.AI powered by Motia! This is a demonstration of what you can build with Motia Streams.
          </p>
        </div>

        <div className="flex flex-col gap-6 items-center justify-center w-full">
          <CreateGameButton onClick={() => navigate('/new')}>Create Game</CreateGameButton>
          <div className="flex flex-row gap-2 items-center justify-center w-full">
            <CreateGameButtonAlt className="w-full flex-1" onClick={() => navigate('/live-matches')}>
              View live match
            </CreateGameButtonAlt>
            <CreateGameButtonAlt onClick={() => navigate('/leaderboard')}>
              <Trophy />
            </CreateGameButtonAlt>
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
    </Page>
  )
}
