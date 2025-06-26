import { LiveMatch } from '@/components/live-match'
import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

export const LiveMatchesPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg">
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
        <div className="relative w-full">
          <ArrowLeft className="absolute left-0 top-1 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-6 items-center justify-center w-full">
          <div className="text-md font-semibold text-white">Matches</div>
          <a href="/ai-game/openai-vs-gemini" className="w-full">
            <LiveMatch white={{ name: 'OpenAI', ai: 'openai' }} black={{ name: 'Gemini', ai: 'gemini' }} />
          </a>
          <a href="/ai-game/gemini-vs-claude" className="w-full">
            <LiveMatch white={{ name: 'Gemini', ai: 'gemini' }} black={{ name: 'Claude', ai: 'claude' }} />
          </a>
          <a href="/ai-game/claude-vs-openai" className="w-full">
            <LiveMatch white={{ name: 'Claude', ai: 'claude' }} black={{ name: 'OpenAI', ai: 'openai' }} />
          </a>
        </div>
        <div className="flex-1" />
      </div>
    </Page>
  )
}
