import { GithubStars } from '@/components/about/github-stars'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import type React from 'react'
import { useNavigate } from 'react-router'

type ParagraphProps = React.PropsWithChildren<{ className?: string }>

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return <p className={cn('font-medium text-white/90 w-full text-justify', className)}>{children}</p>
}

export const DISCORD_HANDLE = 'https://discord.com/invite/nJFfsH5d6v'

export const AboutPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg overflow-y-auto">
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
        <div className="relative flex flex-row items-center justify-center w-full">
          <ArrowLeft className="absolute left-0 top-1 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>
        <div className="flex flex-col gap-2 items-center justify-center">
          <img src="/horse.png" alt="ChessArena.AI" className="h-[160px] w-auto" />
          <h1 className="text-6xl font-title text-white mb-6">ChessArena.AI</h1>

          <Paragraph>
            This platform is built by{' '}
            <a href="https://motia.dev" target="_blank" className="text-white underline">
              Motia Framework
            </a>{' '}
            to showcase how simple it is to build a real-time application with Motia Streams. You can find the source
            code of this project on{' '}
            <a href="https://github.com/MotiaDev/chessarena-ai" target="_blank" className="text-white underline">
              GitHub
            </a>
            .
          </Paragraph>

          <Paragraph>
            Motia is an opensource under MIT license code-first framework designed to empower developers to build
            robust, scalable, and observable event-driven systems with unparalleled ease. We handle the infrastructure
            complexities, so you can focus on your business logic. Unify endpoints, workflows, and agents. Read our
            manifesto{' '}
            <a href="https://motia.dev/manifesto" target="_blank" className="text-white underline">
              here
            </a>{' '}
            and make sure to join our{' '}
            <a href={DISCORD_HANDLE} target="_blank" className="text-white underline">
              Discord
            </a>{' '}
            server.
          </Paragraph>

          <div className="w-1/8 h-[2px] bg-white/25 my-4 rounded-full" />
        </div>

        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <p className="text-white font-semibold pb-2 text-center">Give our projects a star on GitHub!</p>
          <GithubStars repo="motia" defaultStars={1900} />
          <GithubStars repo="chessarena-ai" defaultStars={10} />
        </div>

        <div className="w-1/8 h-[2px] bg-white/25 my-4 rounded-full" />

        <Paragraph className="pb-4 text-xs text-center">
          We're using some opensource libraries under GPL-3.0 license, such as{' '}
          <a href="https://www.npmjs.com/package/chessground" target="_blank" className="text-white underline">
            Chessground
          </a>
          . We're also using{' '}
          <a href="https://www.npmjs.com/package/chess.js" target="_blank" className="text-white underline">
            chess.js
          </a>{' '}
          library under BSD-2-Clause.
        </Paragraph>
      </div>
    </Page>
  )
}
