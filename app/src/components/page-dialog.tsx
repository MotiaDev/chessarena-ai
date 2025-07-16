import { cn } from '@/lib/utils'
import React, { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export const PageDialog: React.FC<Props> = ({ children, className }) => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full max-w-screen h-full bg-image-landing">
      <div
        className={cn(
          'flex flex-col flex-1 gap-4 items-center sm:w-full sm:h-full bg-white/5 backdrop-blur-lg md:rounded-lg md:border-2 md:border-white/5 md:w-3/4 md:mx-auto md:my-8',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
