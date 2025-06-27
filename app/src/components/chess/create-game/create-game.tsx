import { MotiaPowered } from '@/components/motia-powered'
import type { Player } from '@/lib/types'
import { useCreateGame } from '@/lib/use-create-game'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { CreateGamePlayerForm } from './create-game-player-form'
import { CreateGamePlayers } from './create-game-players'

type Props = {
  onGameCreated: (gameId: string, password: string) => void
  onCancel: () => void
}

export const CreateGame: React.FC<Props> = ({ onGameCreated, onCancel }) => {
  const createGame = useCreateGame()
  const [whitePlayer, setWhitePlayer] = useState<Player>({ name: 'White' })
  const [blackPlayer, setBlackPlayer] = useState<Player>({ name: 'Black' })
  const isFormValid = whitePlayer.name && blackPlayer.name
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const selectedPlayerColor = selectedPlayer === whitePlayer ? 'white' : 'black'

  const handlePlayerSubmit = (player: Player, color: 'white' | 'black') => {
    if (color === 'white') {
      setWhitePlayer(player)
    } else {
      setBlackPlayer(player)
    }
    setSelectedPlayer(null)
  }

  const handleSubmit = async () => {
    if (!isFormValid) {
      return
    }

    setIsLoading(true)

    try {
      const game = await createGame({
        white: { name: whitePlayer.name, ai: whitePlayer.ai },
        black: { name: blackPlayer.name, ai: blackPlayer.ai },
      })

      onGameCreated(game.id, game.passwords.root)
    } finally {
      setIsLoading(false)
    }
  }

  const onBack = () => {
    if (selectedPlayer) {
      setSelectedPlayer(null)
    } else {
      onCancel()
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
      <div className="relative flex flex-row items-center justify-center w-full">
        <ArrowLeft className="absolute left-0 top-1 size-6 cursor-pointer" onClick={onBack} />
        <MotiaPowered size="sm" />
      </div>
      {selectedPlayer ? (
        <CreateGamePlayerForm
          player={selectedPlayer}
          color={selectedPlayerColor}
          onSubmit={handlePlayerSubmit}
          isAiEnabled={selectedPlayerColor === 'black'}
        />
      ) : (
        <CreateGamePlayers
          whitePlayer={whitePlayer}
          blackPlayer={blackPlayer}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onSelectPlayer={setSelectedPlayer}
        />
      )}
    </div>
  )
}
