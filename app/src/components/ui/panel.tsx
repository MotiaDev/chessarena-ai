import React, { type PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type Props = PropsWithChildren<{ className?: string }>

export const Panel: React.FC<Props> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 items-center justify-between w-screen backdrop-blur-lg bg-black/40',
        className,
      )}
    >
      {children}
    </div>
  )
}
