import { cn } from '@/lib/utils'
import React, { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export const Page: React.FC<Props> = ({ children, className }) => {
  return (
    <div className="flex flex-col flex-1 gap-4 items-center justify-center w-full h-full bg-image-landing">
      <div className={cn('flex flex-col flex-1 gap-4 items-center justify-between w-full h-full', className)}>
        {children}
      </div>
    </div>
  )
}
