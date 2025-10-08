import { cn } from '@/lib/utils'
import React, { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export const PageDialog: React.FC<Props> = ({ children, className }) => {
  return (
    <div className="h-dvh bg-image-landing overflow-y-auto">
      <div className={cn('flex flex-col min-h-full max-w-7xl md:w-3/4 md:mx-auto md:py-8', className)}>{children}</div>
    </div>
  )
}
