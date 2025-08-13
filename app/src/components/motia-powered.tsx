import { cn } from '@/lib/utils'

type Props = {
  size?: 'sm' | 'md'
  githubLogo?: boolean
}

export const MotiaPowered: React.FC<Props> = ({ size = 'md', githubLogo }) => {
  return (
    <a
      href="https://github.com/MotiaDev/chessarena-ai"
      target="_blank"
      className="flex flex-row md:flex-col gap-2 items-center justify-center"
    >
      <img
        src={githubLogo ? '/github-white.svg' : '/icon-white.svg'}
        alt="Motia Logo"
        className={cn('h-8', size === 'sm' && 'h-6')}
      />
      <p className="text-muted-foreground font-semibold text-sm">Powered by open-source</p>
    </a>
  )
}
