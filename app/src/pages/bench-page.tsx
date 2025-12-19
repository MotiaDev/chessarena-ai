import { useState } from 'react'
import { Layout } from '@/components/layout'
import { usePageTitle } from '@/lib/use-page-title'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tab } from '@/components/ui/tab'
import { MiniArea } from '@/components/bench/bench-charts'
import { BenchBarChart } from '@/components/bench/bench-bar-charts'
import { mockBenchLeaderboard, mockBenchTimeseries, mockPrompts } from '@/components/bench/bench-mock'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { BarChart3, ShieldCheck, Swords, Brain } from 'lucide-react'

export const BenchPage = () => {
  usePageTitle('Moita Chess Bench')
  const [promptTab, setPromptTab] = useState('legal')

  return (
    <Layout>
      <div className="flex flex-col gap-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Benchmark Suite</h1>
            <p className="text-lg text-white/50 leading-relaxed">
              Evaluating AI chess capabilities across <span className="text-emerald-400">legal move generation</span>,{' '}
              <span className="text-sky-400">puzzle solving</span>, and <span className="text-amber-400">move quality</span>.
              Transparent, reproducible, and open source.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
                  View Prompts
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-[#09090b] border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Benchmark Prompts (Transparency)</DialogTitle>
                </DialogHeader>
                <div className="w-full mt-4">
                  <div className="flex flex-row overflow-x-auto border-b border-white/10 mb-4">
                    <Tab isSelected={promptTab === 'legal'} onClick={() => setPromptTab('legal')}>
                      Legal moves
                    </Tab>
                    <Tab isSelected={promptTab === 'puzzle'} onClick={() => setPromptTab('puzzle')}>
                      Puzzles
                    </Tab>
                    <Tab isSelected={promptTab === 'guided'} onClick={() => setPromptTab('guided')}>
                      Arena (guided)
                    </Tab>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    {promptTab === 'legal' && (
                    <SyntaxHighlighter language="text" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem' }}>
                      {mockPrompts.legalMoveBench}
                    </SyntaxHighlighter>
                    )}
                    {promptTab === 'puzzle' && (
                    <SyntaxHighlighter language="text" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem' }}>
                      {mockPrompts.puzzleBench}
                    </SyntaxHighlighter>
                    )}
                    {promptTab === 'guided' && (
                    <SyntaxHighlighter language="text" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem' }}>
                      {mockPrompts.aiPlayerGuided}
                    </SyntaxHighlighter>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Global Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 group hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div className="font-semibold text-white">Legal Move Gen</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mockBenchTimeseries.legalMoveScore.at(-1)?.v ?? 0}%</div>
            <div className="text-sm text-white/40 mb-6">Global Average (7d)</div>
            <MiniArea points={mockBenchTimeseries.legalMoveScore} stroke="#34d399" height={48} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 group hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Swords size={20} />
              </div>
              <div className="font-semibold text-white">Puzzle Solving</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mockBenchTimeseries.puzzleScore.at(-1)?.v ?? 0}%</div>
            <div className="text-sm text-white/40 mb-6">Global Average (7d)</div>
            <MiniArea points={mockBenchTimeseries.puzzleScore} stroke="#38bdf8" height={48} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 group hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Brain size={20} />
              </div>
              <div className="font-semibold text-white">Move Quality</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mockBenchTimeseries.acpl.at(-1)?.v ?? 0}</div>
            <div className="text-sm text-white/40 mb-6">Avg ACPL (7d)</div>
            <MiniArea points={mockBenchTimeseries.acpl} stroke="#fbbf24" height={48} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Comparison Charts */}
        <div className="space-y-8">
           <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-white/60" size={20} />
              <h2 className="text-xl font-semibold text-white">Model Comparison</h2>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BenchBarChart
                title="Motia Chess Index"
                description="Aggregated score combining accuracy, puzzle solving, and legality."
                rows={mockBenchLeaderboard}
                metric="motiaChessIndex"
              />
              <BenchBarChart
                title="Legal vs Illegal Moves"
                description="Percentage of strictly legal moves generated vs illegal/missed attempts."
                rows={mockBenchLeaderboard}
                metric="legalVsIllegal"
              />
              <BenchBarChart
                title="Puzzle Solving Accuracy"
                description="Success rate on standard mate-in-1 and tactics puzzles."
                rows={mockBenchLeaderboard}
                metric="puzzleScore"
                unit="%"
              />
              <BenchBarChart
                title="Move Quality (ACPL)"
                description="Average Centipawn Loss against Stockfish 16 (lower is better)."
                rows={mockBenchLeaderboard}
                metric="acplScore"
              />
           </div>
        </div>

      </div>
    </Layout>
  )
}
