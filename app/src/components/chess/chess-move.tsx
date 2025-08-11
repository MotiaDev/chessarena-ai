import { ArrowRight } from 'lucide-react'
import type React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  move: string[]
  color: 'white' | 'black'
}

export const ChessMove: React.FC<Props> = ({ move, color }) => {
  return (
    <div
      className={cn(
        'flex flex-row gap-2 items-center uppercase font-bold text-lg',
        color === 'white' ? 'text-black' : 'text-white',
      )}
    >
      {move[0]} <ArrowRight className={cn('size-4', color === 'white' ? 'text-gray-700' : 'text-gray-400')} /> {move[1]}
    </div>
  )
}
