import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card = React.forwardRef<HTMLDivElement, Props>(({ children, className, onClick }, ref) => {
  return (
    <div className={cn('font-medium p-4 rounded-sm bg-white/5', className)} onClick={onClick} ref={ref}>
      {children}
    </div>
  )
})
