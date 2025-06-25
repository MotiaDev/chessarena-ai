import { useGetLiveAiGame, type AiModel } from '@/lib/use-get-live-ai-game'
import { Selector } from '@/components/ui/selector'

const avatars: Record<AiModel, string> = {
  openai: '/avatars/openai-white.png',
  gemini: '/avatars/gemini-black.png',
  claude: '/claude.png',
}

const liveAiGames: { white: AiModel; black: AiModel }[] = [
  { white: 'openai', black: 'gemini' },
  { white: 'gemini', black: 'claude' },
  { white: 'claude', black: 'openai' },
]

export const LiveAiGame = () => {
  const { getLiveAiGame } = useGetLiveAiGame()

  return (
    <div className="flex flex-row gap-2 items-center justify-between w-full">
      {liveAiGames.map((game) => (
        <Selector key={`${game.white}-vs-${game.black}`} onClick={() => getLiveAiGame(game.white, game.black)}>
          <img src={avatars[game.white]} alt={game.white} className="h-[24px] w-auto" />
          vs.
          <img src={avatars[game.black]} alt={game.black} className="h-[24px] w-auto" />
        </Selector>
      ))}
    </div>
  )
}
