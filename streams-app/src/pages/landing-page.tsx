import { useNavigate } from 'react-router'
import { CreateGameButton } from '../components/chess/create-game/create-game-button'
import { LiveAiGame } from '../components/chess/create-game/live-ai-game'
import { MotiaPowered } from '../components/motia-powered'
import { Page } from '../components/page'

export const LandingPage = () => {
  const navigate = useNavigate()

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
          <div className="flex flex-row gap-2 items-center justify-center w-full text-muted-foreground text-md font-semibold">
            <div className="h-[1px] flex-1 bg-white/10" />
            Or watch a live AI game
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <LiveAiGame />
        </div>
      </div>
    </Page>
  )
}
