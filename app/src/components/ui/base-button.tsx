import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import './base-button.css'

type Props = React.ComponentProps<'button'> & {
  isLoading?: boolean
}

export const BaseButton: React.FC<Props> = ({ className, children, isLoading, ...props }) => {
  return (
    <button className={cn('chess-arena-button', className)} {...props}>
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  )
}
