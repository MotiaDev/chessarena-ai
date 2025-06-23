import type React from 'react'
import type { Game } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ChessIcon } from './chess-icon'
import { ChessMove } from './chess-move'

export const ChessLastGameMove: React.FC<{ game: Game }> = ({ game }) => {
  const move = game.lastMove

  return (
    <div className="px-4 w-full border-b-2 border-white/5 pb-4 max-md:pt-4">
      <div
        className={cn(
          'flex flex-row justify-between font-medium w-full p-4 bg-white/5 rounded-sm',
          !move && 'text-muted-foreground',
        )}
      >
        {move ? (
          <div className="flex flex-row gap-2 items-center">
            <ChessIcon size={24} color={game.turn === 'white' ? 'black' : 'white'} />
            {game.turn === 'white' ? 'Black move' : 'White move'}
          </div>
        ) : (
          <div>No moves have been made</div>
        )}

        {move && <ChessMove move={move} />}
      </div>
    </div>
  )
}
