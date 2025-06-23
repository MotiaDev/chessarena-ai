import { useCreateGame } from '@/lib/use-create-game'
import { useState } from 'react'
import { Checkbox } from '../../ui/checkbox'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { CreateGameButton } from './create-game-button'
import { MotiaPowered } from '../../motia-powered'
import { CreateGamePlayer } from './create-game-player'
import { Loader2 } from 'lucide-react'

type Props = {
  onGameCreated: (gameId: string, password: string) => void
}

export const CreateGame: React.FC<Props> = ({ onGameCreated }) => {
  const createGame = useCreateGame()
  const [whiteName, setWhiteName] = useState('White')
  const [blackName, setBlackName] = useState('Black')
  const [isAiEnabled, setIsAiEnabled] = useState(false)
  const isFormValid = whiteName && blackName
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!isFormValid) {
      return
    }

    setIsLoading(true)

    try {
      const game = await createGame({
        white: { name: whiteName },
        black: { name: blackName, ai: isAiEnabled ? 'openai' : undefined },
      })

      onGameCreated(game.id, game.passwords.root)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
      <MotiaPowered />
      <div className="flex flex-col gap-2 items-center justify-center">
        <img src="/horse.png" alt="ChessArena.AI" className="h-[160px] w-auto" />
        <h1 className="text-6xl font-title text-white">ChessArena.AI</h1>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center w-full">
        <div className="text-sm text-foreground font-semibold mb-2">Set up</div>
        <CreateGamePlayer name={whiteName} color="white" ai={isAiEnabled ? 'openai' : undefined} />
        <CreateGamePlayer name={blackName} color="black" ai={isAiEnabled ? 'openai' : undefined} />
      </div>

      {isLoading ? (
        <div className="flex flex-row gap-2 items-center justify-center w-full h-[64px] font-medium text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Your match is loading...
        </div>
      ) : (
        <CreateGameButton onClick={handleSubmit}>Start match</CreateGameButton>
      )}
    </div>
  )
}
