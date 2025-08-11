import type { GameMessage } from '@chessarena/types/game-message'
import { cn } from '@/lib/utils'
import React, { memo, useEffect, useRef } from 'react'

type Props = {
  message: GameMessage
  isLast?: boolean
}

const colors = [
  'text-lime-400',
  'text-purple-400',
  'text-pink-400',
  'text-red-400',
  'text-teal-400',
  'text-orange-400',
  'text-amber-400',
  'text-emerald-400',
  'text-cyan-400',
  'text-sky-400',
  'text-violet-400',
  'text-fuchsia-400',
  'text-rose-400',
]

const useNameColor = (name: string) => {
  // Generate consistent hash from string
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const index = Math.abs(hash) % colors.length // Use hash to pick color

  return colors[index]
}

export const ChessSidechatMessage: React.FC<Props> = memo(({ message, isLast }) => {
  const ref = useRef<HTMLDivElement>(null)
  const color = useNameColor(message.sender)

  useEffect(() => {
    if (isLast && ref.current) {
      ref.current.scrollIntoView({ behavior: 'instant', block: 'end' })
    }
  }, [isLast, message.message])

  return (
    <div ref={ref}>
      <span className={cn('capitalize font-bold', color)}>{message.sender}</span>
      <span className="text-md font-medium whitespace-pre-wrap text-white"> {message.message}</span>
    </div>
  )
})
