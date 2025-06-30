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
        'flex flex-row gap-2 items-center justify-center rounded-xl py-1 px-4 font-semibold text-sm transition-all duration-200',
        !isSelected && 'bg-white/5 hover:bg-white/10',
        isSelected && 'bg-white/20',
        !!onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
