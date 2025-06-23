import type { Key } from 'chessground/types'
import { ArrowRight } from 'lucide-react'
import type React from 'react'

export const ChessMove: React.FC<{ move: Key[] }> = ({ move }) => {
  return (
    <div className="flex flex-row gap-2 items-center uppercase font-bold text-lg">
      {move[0]} <ArrowRight className="size-4 text-muted-foreground" /> {move[1]}
    </div>
  )
}
