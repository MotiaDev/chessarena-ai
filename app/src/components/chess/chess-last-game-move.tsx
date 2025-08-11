import type { Game } from '@chessarena/types/game'
import { cn } from '@/lib/utils'
import type React from 'react'
import { ChessIcon } from './chess-icon'
import { ChessMove } from './chess-move'

export const ChessLastGameMove: React.FC<{ game: Game }> = ({ game }) => {
  const move = game.lastMove
  const isCompleted = game.status === 'completed'
  const isDraw = game.status === 'draw'
  const color = game.turn === 'white' ? 'black' : 'white'

  return (
    <div
      className={cn(
        'font-medium p-2 md:p-4  rounded-sm flex flex-row justify-between w-full',
        color === 'white' ? 'bg-white/60 text-black' : 'bg-black/40 text-white',
        !move && 'text-muted-foreground',
        (isCompleted || isDraw) && 'bg-green-500/20 text-green-100',
      )}
    >
      {isDraw ? (
        <div className="flex flex-row gap-2 items-center font-semibold text-lg">Draw</div>
      ) : isCompleted ? (
        <div className="flex flex-row gap-2 items-center font-semibold text-lg">
          <ChessIcon size={24} color={game.turn === 'white' ? 'black' : 'white'} transparent />
          {game.winner === 'white' ? 'White wins' : 'Black wins'}
        </div>
      ) : move ? (
        <div className="flex flex-row gap-2 items-center">
          <ChessIcon size={24} color={game.turn === 'white' ? 'black' : 'white'} transparent />
          {game.turn === 'white' ? 'Black move' : 'White move'}
        </div>
      ) : (
        <div>No moves have been made</div>
      )}

      {move && <ChessMove move={move} color={color} />}
    </div>
  )
}
