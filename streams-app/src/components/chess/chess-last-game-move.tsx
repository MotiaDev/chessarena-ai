import { Card } from '@/components/ui/card'
import type { Game } from '@/lib/types'
import { cn } from '@/lib/utils'
import type React from 'react'
import { ChessIcon } from './chess-icon'
import { ChessMove } from './chess-move'

export const ChessLastGameMove: React.FC<{ game: Game }> = ({ game }) => {
  const move = game.lastMove
  const isCompleted = game.status === 'completed'
  const isDraw = game.status === 'draw'

  return (
    <Card
      className={cn(
        'flex flex-row justify-between w-full',
        !move && 'text-muted-foreground',
        isCompleted || isDraw ? 'bg-green-500/20 text-green-100' : 'bg-white/5',
      )}
    >
      {isDraw ? (
        <div className="flex flex-row gap-2 items-center font-semibold text-lg">Draw</div>
      ) : isCompleted ? (
        <div className="flex flex-row gap-2 items-center font-semibold text-lg">
          <ChessIcon size={24} color={game.turn === 'white' ? 'black' : 'white'} />
          {game.winner === 'white' ? 'White wins' : 'Black wins'}
        </div>
      ) : move ? (
        <div className="flex flex-row gap-2 items-center">
          <ChessIcon size={24} color={game.turn === 'white' ? 'black' : 'white'} />
          {game.turn === 'white' ? 'Black move' : 'White move'}
        </div>
      ) : (
        <div>No moves have been made</div>
      )}

      {move && <ChessMove move={move} />}
    </Card>
  )
}
