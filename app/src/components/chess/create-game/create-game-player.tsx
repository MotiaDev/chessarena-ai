import type { Player } from '@/lib/types'
import { ChevronDown } from 'lucide-react'
import { AiIcon } from '../ai-icon'
import { ChessIcon } from '../chess-icon'

type Props = {
  player: Player
  color: 'white' | 'black'
  onClick: () => void
  viewOnly?: boolean
}

export const CreateGamePlayer: React.FC<Props> = ({ player, color, onClick, viewOnly }) => {
  return (
    <div
      className="flex flex-row gap-4 items-center justify-between border rounded-lg py-4 px-8 w-full border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-row gap-4 items-center">
        <ChessIcon color={color} />
        <div className="flex flex-col gap-1">
          <p className="text-md font-semibold">{player.name}</p>
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        {player.ai ? <AiIcon ai={player.ai} color={'#3B6AD7'} /> : <p className="text-sm text-muted-foreground">Human</p>}
        {!viewOnly && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>
    </div>
  )
}
