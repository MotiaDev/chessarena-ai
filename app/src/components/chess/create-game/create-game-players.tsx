import { Loader2 } from 'lucide-react'
import type { Player } from '@chessarena/types/game'
import { CreateGameButton } from './create-game-button'
import { CreateGamePlayer } from './create-game-player'

type Props = {
  whitePlayer: Player
  blackPlayer: Player
  isLoading: boolean
  onSubmit: () => void

  onSelectPlayer: (player: Player) => void
}

export const CreateGamePlayers: React.FC<Props> = ({
  whitePlayer,
  blackPlayer,
  isLoading,
  onSubmit,
  onSelectPlayer,
}) => {
  const selectPlayerClick = (player: Player) => {
    if (!isLoading) {
      onSelectPlayer(player)
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      <div className="flex-1" />

      <div className="flex flex-col gap-2 items-center justify-center">
        <img src="/horse.png" alt="Chessarena.ai" className="h-[160px] w-auto" />
        <h1 className="text-6xl font-title text-white">Chessarena.ai</h1>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center w-full">
        <div className="text-sm text-foreground font-semibold mb-2">Set up</div>
        <CreateGamePlayer player={whitePlayer} color="white" onClick={() => selectPlayerClick(whitePlayer)} />
        <CreateGamePlayer player={blackPlayer} color="black" onClick={() => selectPlayerClick(blackPlayer)} />
      </div>

      <div className="flex-1" />

      {isLoading ? (
        <div className="flex flex-row gap-2 items-center justify-center w-full h-[64px] font-medium text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Your match is loading...
        </div>
      ) : (
        <CreateGameButton onClick={onSubmit}>Start match</CreateGameButton>
      )}
    </div>
  )
}
