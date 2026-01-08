import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { usePageTitle } from '@/lib/use-page-title'
import { Layout, SidebarPanel } from '@/components/layout'
import { BenchBarChart, providerColors } from '@/components/bench/bench-bar-charts'
import { mockBenchLeaderboard } from '@/components/bench/bench-mock'
import { Trophy } from 'lucide-react'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { useStreamGroup } from '@motiadev/stream-client-react'
import type { LegalMoveBenchmarkSummary } from '@chessarena/types/legal-move-benchmark'
import type { PuzzleBenchmarkSummary } from '@chessarena/types/puzzle-benchmark'
import { TopBar } from '@/components/ui/top-bar'
import { ChessArenaLogo } from '@/components/ui/chess-arena-logo'
import { CreateGameButton } from '@/components/chess/create-game/create-game-button'
import { BaseButton } from '@/components/ui/base-button'
import { AuthContainer } from '@/components/auth/auth-container'

export const LandingPage = () => {
  const navigate = useNavigate()
  usePageTitle('Powered by Motia')

  const [activeTab, setActiveTab] = useState<'benchmarks' | 'leaderboard' | 'methodology'>('benchmarks')

  const goToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate('/about')
  }

  // Stream data for benchmarks
  const { data: legalSummaries } = useStreamGroup<LegalMoveBenchmarkSummary>({
    streamName: 'legalMoveBenchmarkSummary',
    groupId: 'models',
  })
  const { data: puzzleSummaries } = useStreamGroup<PuzzleBenchmarkSummary>({
    streamName: 'puzzleBenchmarkSummary',
    groupId: 'models',
  })

  const benchRows = useMemo(() => {
    const legalById = new Map(legalSummaries.map((s) => [`${s.provider}:${s.model}`, s]))
    const puzzleById = new Map(puzzleSummaries.map((s) => [`${s.provider}:${s.model}`, s]))

    return mockBenchLeaderboard.map((row) => {
      const legal = legalById.get(row.id)
      const puzzle = puzzleById.get(row.id)

      const legalMoveScore = legal?.averageScore ?? 0
      const puzzleScore = puzzle?.overallAccuracy ?? 0
      const motiaChessIndex = Number(((legalMoveScore + puzzleScore) / 2).toFixed(1))
      const lastUpdatedAt = Math.max(legal?.lastRunAt ?? 0, puzzle?.lastRunAt ?? 0, row.lastUpdatedAt)

      return {
        ...row,
        legalMoveScore,
        puzzleScore,
        motiaChessIndex,
        lastUpdatedAt,
      }
    })
  }, [legalSummaries, puzzleSummaries])

  // Left panel content based on active tab
  const leftPanelContent = (
    <SidebarPanel activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'benchmarks' && (
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-white/5">
            <h2 className="text-lg font-bold text-white mb-1">AI Benchmark Results</h2>
            <p className="text-xs text-white/40">Real-time performance metrics across all models</p>
          </div>

          {/* Provider Legend */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Providers</span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(providerColors).map(([provider, color]) => (
                <div key={provider} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-white/50 capitalize font-medium">{provider}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Motia Chess Index */}
          <BenchBarChart
            title="Motia Chess Index"
            description="Combined score of legal moves + puzzle solving"
            rows={benchRows}
            metric="motiaChessIndex"
            topN={8}
            hiddenModels={new Set()}
          />

          {/* Legal Move Score */}
          <BenchBarChart
            title="Legal Move Generation"
            description="F1 score for correctly enumerating legal moves"
            rows={benchRows}
            metric="legalMoveScore"
            unit="%"
            topN={8}
            hiddenModels={new Set()}
          />

          {/* Puzzle Score */}
          <BenchBarChart
            title="Puzzle Solving"
            description="Accuracy on mate-in-1 and tactical puzzles"
            rows={benchRows}
            metric="puzzleScore"
            unit="%"
            topN={8}
            hiddenModels={new Set()}
          />
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard />
      )}

      {activeTab === 'methodology' && (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Benchmark Methodology</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Our benchmarks evaluate LLM chess capabilities across multiple dimensions:
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">Legal Move Generation</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Models are given a FEN position and asked to list all legal moves.
                We measure F1 score comparing predicted vs actual legal moves.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-semibold text-sky-400 mb-2">Puzzle Solving</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Models solve mate-in-1 and tactical puzzles from Lichess.
                We track accuracy across 100+ puzzles per model.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">Move Quality (ACPL)</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Average Centipawn Loss measures how optimal each move is
                compared to Stockfish 16 analysis. Lower is better.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => navigate('/methodology')}
              className="w-full py-3 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              View Full Methodology →
            </button>
          </div>
        </div>
      )}
    </SidebarPanel>
  )

  return (
    <Layout leftPanel={leftPanelContent}>
      {/* Top Bar */}
      <TopBar />

      {/* Main Content - Similar to original main branch */}
      <div className="flex flex-col justify-center grow gap-2 text-center">
        <ChessArenaLogo />
        <p className="font-medium text-center text-muted-foreground">Welcome to ChessArena.ai powered by Motia!</p>
        <p className="font-medium text-center text-muted-foreground">
          ChessArena.ai was created to show how leading models compete against each other in chess games.{' '}
          <a href="/about" className="text-white underline" onClick={goToAbout}>
            Click here to learn more.
          </a>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center justify-center w-full">
        <AuthContainer />
        <CreateGameButton onClick={() => navigate('/new')}>Create Game</CreateGameButton>
        <div className="flex flex-row flex-wrap gap-2 items-center justify-center w-full">
          <BaseButton className="flex-1" onClick={() => navigate('/live-matches')}>
            View Live Matches
          </BaseButton>
          <BaseButton className="min-w-[64px] shrink-0 md:flex-1" onClick={() => navigate('/leaderboard')}>
            <Trophy className="shrink-0" /> <span className="hidden sm:block">Leaderboard</span>
          </BaseButton>
        </div>

        <p className="font-medium text-sm text-center text-muted-foreground">
          This project is open-source, click{' '}
          <a href="/about" className="text-white underline" onClick={goToAbout}>
            here
          </a>{' '}
          to read more about the project.
        </p>
      </div>
    </Layout>
  )
}
