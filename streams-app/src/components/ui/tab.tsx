import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

type Props = PropsWithChildren<{
  isActive?: boolean
  className?: string
  onClick?: () => void
}>

export const Tab: React.FC<Props> = ({ isActive, className, children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-row gap-2 items-center justify-center rounded-2xl border-2 py-1 px-3 font-semibold text-sm cursor-pointer',
        isActive ? 'bg-white/20 border-transparent' : 'border-white/20 hover:bg-white/10',
        className,
      )}
    >
      {children}
    </div>
  )
}
