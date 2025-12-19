import { useNavigate } from 'react-router'
import { usePageTitle } from '@/lib/use-page-title'
import { Layout } from '@/components/layout'
import { BenchBarChart, ParetoChart } from '@/components/bench/bench-bar-charts'
import { mockBenchLeaderboard, mockBenchTimeseries } from '@/components/bench/bench-mock'
import { MiniArea } from '@/components/bench/bench-charts'
import { Swords, Bot, Trophy, Activity } from 'lucide-react'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { useStreamGroup } from '@motiadev/stream-client-react'
import type { LiveAiGames } from '@chessarena/types/live-ai-games'
import { LiveMatch } from '@/components/live-match'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export const LandingPage = () => {
  const navigate = useNavigate()
  usePageTitle('ChessArena Dashboard')

  const { data: liveAiGames } = useStreamGroup<LiveAiGames>({ streamName: 'chessLiveAiGames', groupId: 'game' })
  const sortedLive = useMemo(() => liveAiGames.slice().reverse(), [liveAiGames])

  return (
    <Layout>
      <div className="flex flex-col gap-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Header Section */}
        <div className="border-b border-white/5 pb-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                  Public LLM Chess Benchmarks
                </h1>
                <p className="text-lg text-white/50 max-w-2xl">
                  Evaluations of reasoning capabilities through chess. Updated live.
                </p>
              </div>
              
              <div className="flex gap-3">
                 <button onClick={() => navigate('/play-ai')} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-all flex items-center gap-2">
                    <Swords size={16} /> Play vs AI
                 </button>
                 <button onClick={() => navigate('/new')} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Bot size={16} /> AI vs AI
                 </button>
              </div>
           </div>

           {/* Quick Stats Ticker */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4 flex items-center justify-between group">
                 <div>
                    <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Motia Index (Top)</div>
                    <div className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                       {Math.max(...mockBenchLeaderboard.map(r => r.motiaChessIndex))}
                    </div>
                 </div>
                 <div className="h-10 w-24 opacity-40 group-hover:opacity-100 transition-opacity">
                    <MiniArea points={mockBenchTimeseries.legalMoveScore} stroke="#34d399" height={40} />
                 </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4 flex items-center justify-between group">
                 <div>
                    <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Legal Moves</div>
                    <div className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">
                       {mockBenchTimeseries.legalMoveScore.at(-1)?.v ?? 0}%
                    </div>
                 </div>
                 <div className="h-10 w-24 opacity-40 group-hover:opacity-100 transition-opacity">
                    <MiniArea points={mockBenchTimeseries.legalMoveScore} stroke="#38bdf8" height={40} />
                 </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4 flex items-center justify-between group">
                 <div>
                    <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Avg ACPL</div>
                    <div className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                       {mockBenchTimeseries.acpl.at(-1)?.v ?? 0}
                    </div>
                 </div>
                 <div className="h-10 w-24 opacity-40 group-hover:opacity-100 transition-opacity">
                    <MiniArea points={mockBenchTimeseries.acpl} stroke="#fbbf24" height={40} />
                 </div>
              </div>
           </div>
        </div>

        {/* Main Charts Section - Vals.ai Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           {/* Card 1: Best Performing Models */}
           <div className="xl:col-span-1">
              <BenchBarChart
                title="Best Performing Models"
                description="Top models ranked by Motia Chess Index."
                rows={mockBenchLeaderboard}
                metric="motiaChessIndex"
                topN={5}
                className="h-full"
              />
           </div>

           {/* Card 2: Pareto Efficient */}
           <div className="xl:col-span-1">
              <ParetoChart 
                 title="Pareto Efficient Models"
                 description="Trade-off between Move Quality (ACPL) and Overall Score."
                 rows={mockBenchLeaderboard}
                 className="h-full"
              />
           </div>

           {/* Card 3: Legal Move Reliability */}
           <div className="xl:col-span-1">
              <BenchBarChart
                title="Legal Move Reliability"
                description="Percentage of perfectly legal move lists generated."
                rows={mockBenchLeaderboard}
                metric="legalMoveScore"
                unit="%"
                topN={5}
                className="h-full"
              />
           </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <BenchBarChart
             title="Puzzle Solving Accuracy"
             description="Performance on mate-in-1 and short tactical puzzles."
             rows={mockBenchLeaderboard}
             metric="puzzleScore"
             unit="%"
             topN={8}
           />
           <BenchBarChart
             title="Move Quality (ACPL)"
             description="Average Centipawn Loss vs Stockfish (inverted scale, higher is better)."
             rows={mockBenchLeaderboard}
             metric="acplScore"
             topN={8}
           />
        </div>

        {/* Arena Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 border-t border-white/5">
          {/* Live Games */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <Activity className="text-white/60" size={20} />
                     <h2 className="text-xl font-semibold text-white">Live Arena</h2>
                  </div>
                  {sortedLive.length > 0 && (
                     <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                
                <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-0 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                     <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Active Matches</span>
                  </div>
                  
                  <div className={cn('flex flex-col', sortedLive.length === 0 && 'p-8')}>
                    {sortedLive.length === 0 ? (
                      <div className="text-center">
                        <div className="text-white/30 text-sm mb-4">No games running</div>
                        <button onClick={() => navigate('/new')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-emerald-400 text-xs font-medium transition-colors">
                           Start AI vs AI Match
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {sortedLive.slice(0, 5).map((game) => (
                           <div key={game.id} className="p-2 hover:bg-white/[0.02] transition-colors">
                              <LiveMatch
                                white={game.players.white}
                                black={game.players.black}
                                onClick={() => navigate(`/game/${game.id}`)}
                              />
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {sortedLive.length > 5 && (
                     <button onClick={() => navigate('/live-matches')} className="w-full py-3 text-xs font-medium text-white/40 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] transition-colors border-t border-white/5">
                        View All Matches
                     </button>
                  )}
                </div>
             </div>
          </div>

          {/* Arena Leaderboard */}
          <div className="lg:col-span-8">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Trophy className="text-white/60" size={20} />
                   <h2 className="text-xl font-semibold text-white">Arena Leaderboard</h2>
                </div>
                <div className="text-xs font-mono text-white/40">ELO RATING</div>
             </div>
             <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
                <Leaderboard />
             </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
