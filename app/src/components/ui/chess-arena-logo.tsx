import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export const ChessArenaLogo = ({ className }: Props) => {
  return (
    <div className={cn('space-y-1', className)}>
      <img src="/horse.png" alt="Chessarena.ai" width={160} height={160} className="max-w-[160px] mx-auto ratio-1/1" />
      <h1 className="text-center text-6xl font-title text-white">ChessArena.ai</h1>
    </div>
  )
}
