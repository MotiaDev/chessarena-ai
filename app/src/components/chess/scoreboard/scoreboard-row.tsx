import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
  white: React.ReactNode
  label: string
  black: React.ReactNode
  size?: 'md' | 'lg'
}

export const ScoreboardRow: React.FC<Props> = ({ white, label, black, size = 'md' }) => {
  return (
    <tr className="text-md font-semibold">
      <td className={cn('py-1 text-left text-muted-foreground', size === 'lg' && 'pt-3')}>{white}</td>
      <td className={cn('py-1 text-center text-white', size === 'lg' && 'pt-3 text-lg font-bold')}>{label}</td>
      <td className={cn('py-1 text-right text-muted-foreground', size === 'lg' && 'pt-3')}>{black}</td>
    </tr>
  )
}
