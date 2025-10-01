import React, { type PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type Props = PropsWithChildren<{
  className?: string
}>

export const PageGrid: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-[minmax(50%,1fr)_minmax(auto,500px)] h-dvh bg-image-landing',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const PageGridRightColumn: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col w-full p-6 gap-10 md:col-start-2 md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg overflow-y-auto',
        className,
      )}
    >
      {children}
    </div>
  )
}
