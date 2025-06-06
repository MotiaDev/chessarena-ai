import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { useCallback } from 'react'
import { ChessGame } from '@/components/chess/chess-game'
import { CreateGame } from '@/components/chess/create-game'
import { socketUrl } from '@/lib/env'
import { useQueryParam } from '@/lib/use-query-param'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [gameId, setGameId] = useQueryParam('game')
  const [password, setPassword] = useQueryParam('pw')

  const handleCreateGame = useCallback(
    async (gameId: string, password: string) => {
      setGameId(gameId)
      setPassword(password)
    },
    [setGameId, setPassword],
  )

  return (
    <MotiaStreamProvider address={socketUrl}>
      {gameId ? (
        <ChessGame gameId={gameId} onClose={() => setGameId(undefined)} password={password} />
      ) : (
        <div className="flex flex-col flex-1 gap-4 items-center justify-center w-full h-full">
          <div className="flex flex-col flex-1 gap-4 items-center justify-center">
            <img src="https://www.motia.dev/logos/logo-white.svg" alt="Motia Logo" className="h-8" />
            <p className="font-medium text-center">Welcome to Chess powered by Motia!</p>
            <CreateGame onGameCreated={handleCreateGame} />
          </div>
        </div>
      )}
      <Toaster />
    </MotiaStreamProvider>
  )
}

export default App
