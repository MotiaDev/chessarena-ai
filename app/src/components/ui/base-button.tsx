import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

type Props = React.ComponentProps<'button'> & {
  isLoading?: boolean
}

export const BaseButton: React.FC<Props> = ({ className, children, isLoading, ...props }) => {
  return (
    <button
      className={cn(
        'base-button flex items-center justify-center h-16 py-2 px-4 gap-2 rounded-md select-none relative font-extrabold border border-transparent cursor-pointer whitespace-nowrap',
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  )
}
