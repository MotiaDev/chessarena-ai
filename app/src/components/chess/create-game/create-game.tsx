import { MotiaPowered } from '@/components/motia-powered'
import type { Player } from '@chessarena/types/game'
import { useCreateGame } from '@/lib/use-create-game'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { CreateGamePlayerForm } from './create-game-player-form'
import { toast } from 'sonner'

type Props = {
  onGameCreated: (gameId: string) => void
  onCancel: () => void
}

export const CreateGame: React.FC<Props> = ({ onGameCreated, onCancel }) => {
  const createGame = useCreateGame()
  const [whitePlayer, setWhitePlayer] = useState<Player>({})
  const [blackPlayer, setBlackPlayer] = useState<Player>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(whitePlayer)
  const selectedPlayerColor = selectedPlayer === whitePlayer ? 'white' : 'black'

  const handleSubmit = async (whitePlayer: Player, blackPlayer: Player) => {
    setIsLoading(true)

    try {
      const game = await createGame({
        white: { ai: whitePlayer.ai, model: whitePlayer.model },
        black: { ai: blackPlayer.ai, model: blackPlayer.model },
      })

      onGameCreated(game.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayerSubmit = (player: Player, color: 'white' | 'black') => {
    if (player.ai && !player.model) {
      toast('An ai model is required', {
        description: 'You must select an ai model to continue',
        position: 'bottom-center',
      })
      return
    }

    if (color === 'white') {
      setWhitePlayer(player)
      setSelectedPlayer(blackPlayer)
    } else {
      setBlackPlayer(player)
      handleSubmit(whitePlayer, player)
    }
  }

  const onBack = () => {
    if (isLoading) {
      return
    }

    if (selectedPlayer === blackPlayer) {
      setSelectedPlayer(whitePlayer)
    } else {
      onCancel()
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full">
      <div className="flex flex-row items-center justify-center w-full">
        <ArrowLeft className="size-6 shrink-0 cursor-pointer" onClick={onBack} />
        <MotiaPowered size="sm" className="grow mr-6" />
      </div>

      <CreateGamePlayerForm
        player={selectedPlayer}
        color={selectedPlayerColor}
        onSubmit={handlePlayerSubmit}
        isAiEnabled
        isLoading={isLoading}
      />
    </div>
  )
}
