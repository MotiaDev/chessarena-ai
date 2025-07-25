import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

type Props = PropsWithChildren<{
  isSelected?: boolean
  className?: string
  onClick?: () => void
}>

export const Selector: React.FC<Props> = ({ isSelected, className, children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-row gap-2 items-center justify-center rounded-md border-2 p-6 font-semibold text-md cursor-pointer',
        !isSelected && 'border-white/20 hover:border-white/30',
        isSelected && 'border-white',
        !onClick && 'cursor-default border-white/5',
        className,
      )}
    >
      {children}
    </div>
  )
}
