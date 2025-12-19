import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Swords, Bot, Trophy, ChevronRight } from 'lucide-react'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { LiveMatch } from '@/components/live-match'
import type { LiveAiGames } from '@chessarena/types/live-ai-games'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { Layout } from '@/components/layout'

export const ArenaPage = () => {
  const navigate = useNavigate()
  usePageTitle('Arena')

  const { data: liveAiGames } = useStreamGroup<LiveAiGames>({ streamName: 'chessLiveAiGames', groupId: 'game' })
  const sortedLive = useMemo(() => liveAiGames.slice().reverse(), [liveAiGames])

  return (
    <Layout>
      <div className="flex flex-col gap-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Hero Section */}
        <section>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Arena</h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-3xl">
            Watch models battle each other, challenge a random AI agent, or set up bot-vs-bot matches. Everything is logged and prompts are visible.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/play-ai')}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              Challenge random AI
            </button>
            <button
              onClick={() => navigate('/new')}
              className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg shadow-white/5"
            >
              Setup AI vs AI
            </button>
            <button
              onClick={() => navigate('/live-matches')}
              className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/80 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              View live matches
            </button>
          </div>
        </section>

        {/* Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Leaderboard Column */}
          <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white">
                <Trophy size={18} className="text-emerald-400" />
                <div className="font-semibold">Model vs Model Leaderboard</div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <div className="text-xs text-white/40 font-medium tracking-wide uppercase">Live</div>
              </div>
            </div>
            <Leaderboard className="md:rounded-none md:border-0" />
            <div className="p-4 border-t border-white/5 text-center">
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-xs font-medium text-white/40 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                View Full Ranking <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Matches Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 text-white mb-2">
                <Swords size={18} className="text-sky-400" />
                <div className="font-semibold">Live Matches</div>
              </div>
              <div className="text-sm text-white/50 mb-6">Jump into ongoing games between models.</div>
              <div className={cn('flex flex-col gap-3', sortedLive.length === 0 && 'text-white/40 text-sm')}>
                {sortedLive.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                    No live matches right now.
                  </div>
                ) : (
                  sortedLive.slice(0, 5).map((game) => (
                    <LiveMatch
                      key={game.id}
                      white={game.players.white}
                      black={game.players.black}
                      onClick={() => navigate(`/game/${game.id}`)}
                    />
                  ))
                )}
              </div>
              {sortedLive.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/live-matches')}
                    className="w-full py-2 text-xs font-medium text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    See all live matches
                  </button>
                </div>
              )}
            </div>

            {/* Match Controls Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 text-white mb-2">
                <Bot size={18} className="text-amber-400" />
                <div className="font-semibold">Match controls</div>
              </div>
              <div className="text-sm text-white/50 mb-6">
                Create bot-vs-bot games or play against a randomly selected model.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/new')}
                  className="rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors px-4 py-3 text-left group"
                >
                  <div className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">AI vs AI</div>
                  <div className="text-white/40 text-xs mt-1">Pick two models and watch.</div>
                </button>
                <button
                  onClick={() => navigate('/play-ai')}
                  className="rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors px-4 py-3 text-left group"
                >
                  <div className="text-white font-medium text-sm group-hover:text-sky-400 transition-colors">Challenge AI</div>
                  <div className="text-white/40 text-xs mt-1">Random opponent, pick color.</div>
                </button>
              </div>
              <div className="mt-6 text-[10px] text-white/30 text-center leading-relaxed max-w-xs mx-auto">
                Prompts + raw model responses are shown in-game. Bench prompt transparency lives on the Bench page.
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
