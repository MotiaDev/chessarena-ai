import { useCallback, useState } from 'react'
import { useQueryParam } from '../lib/use-query-param'
import { CreateGame } from './chess/create-game/create-game'
import { CreateGameButton } from './chess/create-game/create-game-button'
import { MotiaPowered } from './motia-powered'
import { cn } from '../lib/utils'
import { ChessGame } from './chess/chess-game'

export const LandingPage = () => {
  const [gameId, setGameId] = useQueryParam('game')
  const [password, setPassword] = useQueryParam('pw')
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)

  const handleCreateGame = useCallback(
    async (gameId: string, password: string) => {
      setGameId(gameId)
      setPassword(password)
      setIsCreateGameOpen(false)
    },
    [setGameId, setPassword],
  )

  return (
    <div className="flex flex-col flex-1 gap-4 items-center justify-center w-full h-full bg-image-landing">
      <div
        className={cn(
          'flex flex-col flex-1 gap-4 items-center justify-between w-full h-full',
          !gameId && 'p-6',
          gameId ? 'w-screen' : 'md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5',
          gameId ? '' : isCreateGameOpen ? 'backdrop-blur-lg' : 'max-md:bg-black/60 md:backdrop-blur-lg',
        )}
      >
        {gameId ? (
          <ChessGame gameId={gameId} onClose={() => setGameId(undefined)} password={password} />
        ) : (
          !isCreateGameOpen && (
            <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
              <MotiaPowered />
              <div className="flex flex-col gap-2 items-center justify-center">
                <img src="/horse.png" alt="ChessArena.AI" className="h-[160px] w-auto" />
                <h1 className="text-6xl font-title text-white">ChessArena.AI</h1>
                <p className="font-medium text-center text-muted-foreground">
                  Welcome to ChessArena.AI powered by Motia! This is a demonstration of what you can build with Motia
                  Streams.
                </p>
              </div>
              <CreateGameButton onClick={() => setIsCreateGameOpen(true)}>Create Game</CreateGameButton>
            </div>
          )
        )}
        {isCreateGameOpen && <CreateGame onGameCreated={handleCreateGame} />}
      </div>
    </div>
  )
}
