import { useState } from 'react'
import { toast } from 'sonner'
import { TopBar } from '@/components/ui/top-bar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { BenchmarkVariant, Player } from '@chessarena/types/game'
import { useCreateGame } from '@/lib/use-create-game'
import { CreateGamePlayerForm } from './create-game-player-form'

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
  const [variant, setVariant] = useState<BenchmarkVariant>('guided')
  const selectedPlayerColor = selectedPlayer === whitePlayer ? 'white' : 'black'

  const handleSubmit = async (whitePlayer: Player, blackPlayer: Player) => {
    setIsLoading(true)

    try {
      const game = await createGame({
        players: {
          white: { ai: whitePlayer.ai, model: whitePlayer.model },
          black: { ai: blackPlayer.ai, model: blackPlayer.model },
        },
        variant,
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
    <div className="flex flex-col flex-1 gap-14 items-center justify-between w-full">
      <TopBar onBack={onBack} />
      <div className="flex flex-col gap-6 w-full items-center">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <Label htmlFor="variant-switch" className="text-white/70 text-sm">
            Guided (with legal moves)
          </Label>
          <Switch
            id="variant-switch"
            checked={variant === 'unguided'}
            onCheckedChange={(checked) => setVariant(checked ? 'unguided' : 'guided')}
          />
          <Label htmlFor="variant-switch" className="text-white/70 text-sm">
            Unguided (FEN only)
          </Label>
        </div>
        <CreateGamePlayerForm
          player={selectedPlayer}
          color={selectedPlayerColor}
          onSubmit={handlePlayerSubmit}
          isAiEnabled
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
