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
        'flex flex-row gap-2 items-center justify-center rounded-md border-[2px] p-6 font-semibold text-md cursor-pointer',
        !isSelected && 'border-transparent bg-white/3 hover:border-white/30',
        isSelected && 'border-white/40 bg-white/5',
        !onClick && 'cursor-default border-white/5',
        className,
      )}
    >
      {children}
    </div>
  )
}
