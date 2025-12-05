import type React from 'react'
import { useNavigate } from 'react-router'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { ChevronRight, Brain, Target, TrendingUp, AlertTriangle, ArrowLeft, Github } from 'lucide-react'

type MetricCardProps = {
  icon: React.ReactNode
  title: string
  formula: string
  description: string
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, formula, description }) => (
  <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors">
    <div className="flex items-center gap-3 text-white mb-3">
      <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
      <span className="font-semibold text-lg">{title}</span>
    </div>
    <code className="block text-sm text-emerald-400 bg-black/40 px-3 py-2 rounded-lg font-mono mb-3">{formula}</code>
    <p className="text-sm text-white/60 leading-relaxed">{description}</p>
  </div>
)

type FlowStepProps = {
  step: string
  number: number
  isLast?: boolean
}

const FlowStep: React.FC<FlowStepProps> = ({ step, number, isLast }) => (
  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center">
        <span className="text-emerald-400 font-bold">{number}</span>
      </div>
      <span className="text-white/80 text-sm mt-2 font-medium">{step}</span>
    </div>
    {!isLast && (
      <div className="w-8 md:w-16 h-px bg-gradient-to-r from-emerald-500/30 to-transparent mx-2" />
    )}
  </div>
)

type VariantCardProps = {
  variant: string
  title: string
  description: string
  details: string[]
  isNew?: boolean
}

const VariantCard: React.FC<VariantCardProps> = ({ variant, title, description, details, isNew }) => (
  <div
    className={cn(
      'rounded-xl p-6 flex-1 min-w-[300px] transition-all',
      isNew
        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/30'
        : 'bg-white/5 border border-white/10 hover:bg-white/10'
    )}
  >
    <div className="flex items-center gap-3 mb-4">
      <span
        className={cn(
          'text-sm font-bold px-3 py-1 rounded-full',
          isNew ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/70'
        )}
      >
        Variant {variant}
      </span>
      {isNew && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">NEW</span>}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/60 text-sm mb-4 leading-relaxed">{description}</p>
    <ul className="space-y-2">
      {details.map((detail, i) => (
        <li key={i} className="text-white/50 text-sm flex items-start gap-2">
          <ChevronRight size={16} className="text-emerald-500/50 mt-0.5 shrink-0" />
          {detail}
        </li>
      ))}
    </ul>
  </div>
)

export const MethodologyPage = () => {
  const navigate = useNavigate()
  usePageTitle('Methodology')

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <a
            href="https://github.com/MotiaDev/chessarena-ai"
            target="_blank"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <Github size={20} />
            <span className="hidden sm:inline">View Source</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-title text-white mb-6">
            How We Measure
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Transparent, reproducible benchmarks for evaluating LLM chess reasoning capabilities.
          </p>
        </div>

        {/* Evaluation Flow */}
        <section className="mb-20">
          <h2 className="text-2xl font-title text-white mb-8">Evaluation Pipeline</h2>
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex flex-wrap items-start justify-center gap-4 md:gap-2">
              <FlowStep step="Prompt" number={1} />
              <FlowStep step="Model" number={2} />
              <FlowStep step="Validate" number={3} />
              <FlowStep step="Score" number={4} />
              <FlowStep step="Record" number={5} isLast />
            </div>
            <p className="text-white/50 text-sm text-center mt-6">
              Each move is validated for legality, then scored against Stockfish for quality analysis.
            </p>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="mb-20">
          <h2 className="text-2xl font-title text-white mb-8">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              icon={<Target size={24} />}
              title="Legal Move Rate"
              formula="legal_moves / total_attempts × 100"
              description="Percentage of moves that are valid chess moves. Measures basic rule understanding."
            />
            <MetricCard
              icon={<TrendingUp size={24} />}
              title="Game Completion Rate"
              formula="finished_games / total_games × 100"
              description="Percentage of games completed without forfeit due to illegal moves."
            />
            <MetricCard
              icon={<Brain size={24} />}
              title="Average Centipawn Loss"
              formula="Σ(best_eval - actual_eval) / moves"
              description="Average quality loss per move compared to Stockfish's best move. Lower is better."
            />
            <MetricCard
              icon={<AlertTriangle size={24} />}
              title="Blunder Rate"
              formula="blunders / total_moves × 100"
              description="Moves with centipawn loss > 100. Indicates major tactical mistakes."
            />
          </div>
        </section>

        {/* Benchmark Variants */}
        <section className="mb-20">
          <h2 className="text-2xl font-title text-white mb-4">Benchmark Variants</h2>
          <p className="text-white/60 mb-8 max-w-2xl">
            Two evaluation modes measure different aspects of chess understanding.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <VariantCard
              variant="A"
              title="Guided Mode"
              description="Model receives the list of legal moves along with the board state."
              details={[
                'Tests move selection and strategy',
                'Eliminates rule knowledge variable',
                'Focuses on positional understanding',
              ]}
            />
            <VariantCard
              variant="B"
              title="Unguided Mode"
              description="Model receives only the board state (FEN) without legal moves."
              details={[
                'Tests true chess rule understanding',
                'Measures ability to generate legal moves',
                'Better indicator of reasoning depth',
              ]}
              isNew
            />
          </div>
        </section>

        {/* Prompt Transparency */}
        <section className="mb-20">
          <h2 className="text-2xl font-title text-white mb-4">Prompt Transparency</h2>
          <p className="text-white/60 mb-8 max-w-2xl">
            Full transparency on the exact prompts sent to models during evaluation.
          </p>
          <div className="bg-black/60 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="text-white/40 text-sm ml-2">prompt-template.mustache</span>
            </div>
            <pre className="p-6 text-sm text-emerald-400 font-mono overflow-x-auto leading-relaxed">
{`You are a chess grandmaster playing as {{player}}.

## Current Position
- FEN: \`{{fen}}\`
{{#inCheck}}- ⚠️ WARNING: You are in check!{{/inCheck}}

## Valid Moves (Variant A only)
{{#validMoves}}- {{san}}
{{/validMoves}}

## Response Format
{
  "thought": "Strategic reasoning",
  "moveSan": "Your move in SAN"
}`}
            </pre>
          </div>
          <p className="text-white/40 text-sm mt-4">
            Variant B omits the "Valid Moves" section entirely.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="mb-20">
          <h2 className="text-2xl font-title text-white mb-8">Benchmark Comparison</h2>
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 text-white/60 font-medium">Benchmark</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium">Measures</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium">Domain</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6">MMLU</td>
                  <td className="py-4 px-6 text-white/60">Knowledge recall</td>
                  <td className="py-4 px-6 text-white/60">Academic subjects</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6">HumanEval</td>
                  <td className="py-4 px-6 text-white/60">Code generation</td>
                  <td className="py-4 px-6 text-white/60">Programming</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6">GSM8K</td>
                  <td className="py-4 px-6 text-white/60">Math reasoning</td>
                  <td className="py-4 px-6 text-white/60">Arithmetic</td>
                </tr>
                <tr className="bg-emerald-500/10">
                  <td className="py-4 px-6 font-semibold text-emerald-400">ChessArena</td>
                  <td className="py-4 px-6 text-white/80">Spatial + rule reasoning</td>
                  <td className="py-4 px-6 text-white/80">Chess strategy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/10">
          <p className="text-white/40">
            Built with{' '}
            <a href="https://motia.dev" target="_blank" className="text-white/60 hover:text-white underline">
              Motia
            </a>
            {' '}•{' '}
            <a href="https://github.com/MotiaDev/chessarena-ai" target="_blank" className="text-white/60 hover:text-white underline">
              Open Source
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}
