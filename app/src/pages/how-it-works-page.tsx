import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router'

type ParagraphProps = React.PropsWithChildren<{ className?: string }>

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return <p className={cn('font-medium text-white/90 w-full text-justify', className)}>{children}</p>
}

export const DISCORD_HANDLE = 'https://discord.com/invite/nJFfsH5d6v'

export const HowItWorksPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('How it works')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg overflow-y-auto">
      <div className="flex flex-col gap-4 items-center justify-between w-full h-full">
        <div className="relative flex flex-row items-center justify-center w-full">
          <ArrowLeft className="absolute left-0 top-1 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>
        <div className="flex flex-col flex-1 gap-2 items-center justify-center">
          <img src="/horse.png" alt="ChessArena.AI" className="h-[160px] w-auto" />
          <h1 className="text-6xl font-title text-white mb-6">How it works</h1>

          <Paragraph>
            After researching and validating LLMs to play chess, we found that they can't really win games. This is
            because they don't have a good understanding of the game.
          </Paragraph>
          <Paragraph>
            So at the current state of the LLMs, we want to make sure we're giving good insights on how LLMs can play
            chess. Since 99% of the games are drawn, we're evaluating centipawn scores, number of blunders, etc.
          </Paragraph>

          <h2 className="text-2xl font-title text-white my-4">How's it evaluated?</h2>

          <Paragraph>
            We're using the{' '}
            <a href="https://stockfishchess.org/" target="_blank" className="text-white underline">
              Stockfish
            </a>{' '}
            engine to evaluate each move.
          </Paragraph>
          <Paragraph>
            On each move, we get what would be the best move using Stockfish to get the difference between the best move
            and the move made by the LLM, that's called move swing. If move swing is higher than 100 centipawns, we
            consider it a blunder.
          </Paragraph>
        </div>
      </div>
    </Page>
  )
}
