import type React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  move: string
  color: 'white' | 'black'
}

export const ChessMove: React.FC<Props> = ({ move, color }) => {
  return (
    <div
      className={cn(
        'flex flex-row gap-2 items-center font-bold text-lg',
        color === 'white' ? 'text-black' : 'text-white',
      )}
    >
      {move}
    </div>
  )
}
