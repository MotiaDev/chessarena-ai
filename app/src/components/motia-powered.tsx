import { cn } from '../lib/utils'

export const MotiaPowered: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <a href="https://motia.dev" target="_blank" className="flex flex-row md:flex-col gap-2 items-center justify-center">
      <img src="/icon-white.svg" alt="Motia Logo" className={cn('h-8', size === 'sm' && 'h-4')} />
      <p className="text-muted-foreground font-semibold text-sm">Powered by Motia</p>
    </a>
  )
}
