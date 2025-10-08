import { cn } from '@/lib/utils'
import React, { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export const PageDialog: React.FC<Props> = ({ children, className }) => {
  return (
    <div className="h-dvh bg-image-landing overflow-y-auto">
      <div className={cn('flex flex-col min-h-full md:p-8', className)}>{children}</div>
    </div>
  )
}
