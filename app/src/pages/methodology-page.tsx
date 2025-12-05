import type React from 'react'
import { useNavigate } from 'react-router'
import { TopBar } from '@/components/ui/top-bar'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { ChevronRight, Brain, Target, TrendingUp, AlertTriangle } from 'lucide-react'

type SectionProps = React.PropsWithChildren<{ title: string; className?: string }>

const Section: React.FC<SectionProps> = ({ title, children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <h2 className="text-2xl font-title text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

type ParagraphProps = React.PropsWithChildren<{ className?: string }>

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return <p className={cn('font-medium text-white/90 w-full text-justify mb-3', className)}>{children}</p>
}

type MetricCardProps = {
  icon: React.ReactNode
  title: string
  formula: string
  description: string
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, formula, description }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-white">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <code className="text-sm text-green-400 bg-black/30 px-2 py-1 rounded font-mono">{formula}</code>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  )
}

type FlowStepProps = {
  step: string
  description: string
  isLast?: boolean
}

const FlowStep: React.FC<FlowStepProps> = ({ step, description, isLast }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center min-w-[100px]">
        <div className="text-white font-semibold text-sm">{step}</div>
        <div className="text-white/60 text-xs">{description}</div>
      </div>
      {!isLast && <ChevronRight className="text-white/40 shrink-0" size={20} />}
    </div>
  )
}

type VariantCardProps = {
  variant: string
  title: string
  description: string
  details: string[]
  highlight?: boolean
}

const VariantCard: React.FC<VariantCardProps> = ({ variant, title, description, details, highlight }) => {
  return (
    <div
      className={cn(
        'border rounded-lg p-4 flex-1 min-w-[280px]',
        highlight ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded',
            highlight ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
          )}
        >
          {variant}
        </span>
        <span className="text-white font-semibold">{title}</span>
      </div>
      <p className="text-white/70 text-sm mb-3">{description}</p>
      <ul className="space-y-1">
        {details.map((detail, i) => (
          <li key={i} className="text-white/60 text-sm flex items-start gap-2">
            <span className="text-white/40">•</span>
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const MethodologyPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('Methodology')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <TopBar onBack={onBack} />
        
        <div className="mt-8 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-title text-white mb-4">How We Measure</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            ChessArena.ai provides transparent, reproducible benchmarks for evaluating LLM chess reasoning.
          </p>
        </div>

        <div className="space-y-16">

          <Section title="Evaluation Flow">
            <Paragraph>
              Each move goes through a standardized pipeline to ensure consistent, fair evaluation across all models.
            </Paragraph>
            <div className="flex flex-wrap items-center gap-2 justify-center bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto">
              <FlowStep step="Prompt" description="Board state sent" />
              <FlowStep step="Model" description="LLM responds" />
              <FlowStep step="Validation" description="Move checked" />
              <FlowStep step="Stockfish" description="Quality scored" />
              <FlowStep step="Record" description="Data stored" isLast />
            </div>
          </Section>

          <Section title="Key Metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                icon={<Target size={20} />}
                title="Legal Move Rate"
                formula="legal_moves / total_attempts × 100"
                description="Percentage of moves that are valid chess moves. Measures basic rule understanding."
              />
              <MetricCard
                icon={<TrendingUp size={20} />}
                title="Game Completion Rate"
                formula="finished_games / total_games × 100"
                description="Percentage of games completed without forfeit due to illegal moves."
              />
              <MetricCard
                icon={<Brain size={20} />}
                title="Average Centipawn Loss"
                formula="Σ(best_eval - actual_eval) / moves"
                description="Average quality loss per move compared to Stockfish's best move. Lower is better."
              />
              <MetricCard
                icon={<AlertTriangle size={20} />}
                title="Blunder Rate"
                formula="blunders / total_moves × 100"
                description="Moves with centipawn loss > 100. Indicates major tactical mistakes."
              />
            </div>
          </Section>

          <Section title="Benchmark Variants">
            <Paragraph>
              We offer two evaluation modes to measure different aspects of chess understanding.
            </Paragraph>
            <div className="flex flex-wrap gap-4">
              <VariantCard
                variant="A"
                title="Guided"
                description="Model receives the list of legal moves along with the board state."
                details={[
                  'Tests move selection and strategy',
                  'Eliminates rule knowledge variable',
                  'Focuses on positional understanding',
                  'Current default mode',
                ]}
              />
              <VariantCard
                variant="B"
                title="Unguided"
                description="Model receives only the board state (FEN) without legal moves."
                details={[
                  'Tests true chess rule understanding',
                  'Measures ability to generate legal moves',
                  'More challenging evaluation',
                  'Better indicator of reasoning depth',
                ]}
                highlight
              />
            </div>
          </Section>

          <Section title="Prompt Transparency">
            <Paragraph>
              We believe in full transparency. Below is the exact prompt template used for Variant A (Guided) evaluation.
              The model receives the current board position, check status, and a list of all legal moves.
            </Paragraph>
            <div className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
{`You are a chess grandmaster playing as {{player}}.

## Current Position
- FEN: \`{{fen}}\`.
{{#inCheck}}- WARNING: You are in check!{{/inCheck}}

## YOUR ONLY VALID MOVES (Variant A only)
{{#validMoves}}
- {{san}}
{{/validMoves}}

## Required Response Format
{
  "thought": "Your strategic reasoning (1-2 sentences)",
  "moveSan": "EXACT_MOVE_FROM_LIST_ABOVE"
}`}
              </pre>
            </div>
            <p className="text-white/50 text-sm mt-2">
              Variant B omits the "VALID MOVES" section, requiring the model to determine legal moves independently.
            </p>
          </Section>

          <Section title="Comparison with Other Benchmarks">
            <Paragraph>
              Chess evaluation complements existing LLM benchmarks by testing spatial reasoning and rule-following
              in a constrained, verifiable domain.
            </Paragraph>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-white/60 font-medium">Benchmark</th>
                    <th className="text-left py-2 px-3 text-white/60 font-medium">Measures</th>
                    <th className="text-left py-2 px-3 text-white/60 font-medium">Domain</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">MMLU</td>
                    <td className="py-2 px-3">Knowledge recall</td>
                    <td className="py-2 px-3">Academic subjects</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">HumanEval</td>
                    <td className="py-2 px-3">Code generation</td>
                    <td className="py-2 px-3">Programming</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 px-3">GSM8K</td>
                    <td className="py-2 px-3">Math reasoning</td>
                    <td className="py-2 px-3">Arithmetic</td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="py-2 px-3 font-semibold text-white">ChessArena</td>
                    <td className="py-2 px-3">Spatial + rule reasoning</td>
                    <td className="py-2 px-3">Chess strategy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <div className="text-center text-white/50 text-sm">
            <p>
              Full source code and methodology available on{' '}
              <a
                href="https://github.com/MotiaDev/chessarena-ai"
                target="_blank"
                className="text-white underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
