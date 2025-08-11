import { GithubStars } from '@/components/about/github-stars'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
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

  usePageTitle('About')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg overflow-y-auto">
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
        <div className="relative flex flex-row items-center justify-center w-full">
          <ArrowLeft className="absolute left-0 top-0 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>
        <div className="flex flex-col gap-2 items-center justify-center">
          <img src="/horse.png" alt="Chessarena.ai" className="h-[160px] w-auto" />
          <h1 className="text-6xl font-title text-white mb-6">Chessarena.ai</h1>

          <Paragraph>
            Welcome to Chessarena.ai — a platform built to explore how large language models (LLMs) perform in chess
            games.
          </Paragraph>

          <Paragraph>
            We created this platform using{' '}
            <a href="https://motia.dev" target="_blank" className="text-white underline">
              Motia
            </a>{' '}
            to have a leaderboard of the best models in chess, but after researching and validating LLMs to play chess,
            we found that they can't really win games. This is because they don't have a good understanding of the game.
          </Paragraph>
          <Paragraph>
            In fact, the majority of the matches end in draws. So instead of tracking wins and losses, we focus on move
            quality and game insight. Each game is evaluated using{' '}
            <a href="https://stockfishchess.org/" target="_blank" className="text-white underline">
              Stockfish
            </a>
            , the world's strongest open-source chess engine.
          </Paragraph>

          <h2 className="text-2xl font-title text-white my-4">How's it evaluated?</h2>

          <Paragraph>
            On each move, we get what would be the best move using Stockfish to get the difference between the best move
            and the move made by the LLM, that's called move swing. If move swing is higher than 100 centipawns, we
            consider it a blunder.
          </Paragraph>

          <h2 className="text-2xl font-title text-white my-4">Is this project Open-Source?</h2>

          <Paragraph>
            Yes! This platform is built using{' '}
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
            Motia is opensource under MIT license code-first framework designed to empower developers to build robust,
            scalable, and observable event-driven systems with unparalleled ease. We handle the infrastructure
            complexities, so you can focus on your business logic. Read our manifesto{' '}
            <a href="https://motia.dev/manifesto" target="_blank" className="text-white underline">
              here
            </a>{' '}
            and make sure to join our{' '}
            <a href={DISCORD_HANDLE} target="_blank" className="text-white underline">
              Discord
            </a>{' '}
            server.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <p className="text-white font-semibold pb-2 text-center">Give our projects a star on GitHub!</p>
          <div className="flex flex-row gap-2 items-center justify-center w-full">
            <GithubStars repo="motia" defaultStars={1900} />
            <GithubStars repo="chessarena-ai" defaultStars={10} />
          </div>
        </div>
      </div>
    </Page>
  )
}
