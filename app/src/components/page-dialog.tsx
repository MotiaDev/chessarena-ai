import { cn } from '@/lib/utils'
import React, { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export const PageDialog: React.FC<Props> = ({ children, className }) => {
  return (
    <div className="h-dvh bg-image-landing">
      <div className={cn('flex flex-col h-full md:w-3/4 md:mx-auto md:py-8', className)}>{children}</div>
    </div>
  )
}
