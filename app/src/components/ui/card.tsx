import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card: React.FC<Props> = ({ children, className, onClick }) => {
  return (
    <div className={cn('font-medium p-4 rounded-sm bg-white/5', className)} onClick={onClick}>
      {children}
    </div>
  )
}
