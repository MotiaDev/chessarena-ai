import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

type Props = PropsWithChildren<{
  isSelected?: boolean
  className?: string
  onClick?: () => void
}>

export const Tab: React.FC<Props> = ({ isSelected, className, children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-row gap-2 items-center justify-center pt-1 pb-3 px-4 font-semibold text-sm transition-all duration-200 border-b-2 border-transparent whitespace-nowrap',
        !isSelected && 'hover:border-white/50',
        isSelected && 'border-white',
        !!onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
