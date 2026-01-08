import React from 'react'
import { usePageTitle } from '@/lib/use-page-title'
import { Layout } from '@/components/layout'
import { ShieldCheck, Brain, Activity, ArrowRight, FileText, Cpu, MessageSquare, CheckCircle, BarChart3 } from 'lucide-react'

const DetailSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-white/5 rounded-lg text-white/80 border border-white/10">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
      {children}
    </div>
  </div>
)

// Visual flow diagram component
const FlowStep = ({ icon, label, description, isLast = false }: { icon: React.ReactNode, label: string, description: string, isLast?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-col items-center">
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/80">
        {icon}
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs font-semibold text-white">{label}</div>
        <div className="text-[10px] text-white/40 max-w-[80px]">{description}</div>
      </div>
    </div>
    {!isLast && (
      <ArrowRight className="text-white/20 mx-1 shrink-0" size={16} />
    )}
  </div>
)

const BenchmarkFlowDiagram = () => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-12">
    <h3 className="text-lg font-semibold text-white mb-6 text-center">How Benchmarks Work</h3>
    <div className="flex flex-wrap items-start justify-center gap-2 md:gap-4">
      <FlowStep
        icon={<FileText size={20} />}
        label="Prompt"
        description="FEN + context sent to model"
      />
      <FlowStep
        icon={<Cpu size={20} />}
        label="Model"
        description="LLM processes the request"
      />
      <FlowStep
        icon={<MessageSquare size={20} />}
        label="Response"
        description="JSON output parsed"
      />
      <FlowStep
        icon={<CheckCircle size={20} />}
        label="Validation"
        description="Checked against rules"
      />
      <FlowStep
        icon={<BarChart3 size={20} />}
        label="Score"
        description="Metrics calculated"
        isLast
      />
    </div>
  </div>
)

// Benchmark comparison with other LLM benchmarks
const BenchmarkComparisonSection = () => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 mb-12">
    <h3 className="text-lg font-semibold text-white mb-4">Why Chess Benchmarks?</h3>
    <p className="text-sm text-white/60 leading-relaxed mb-6">
      While benchmarks like MMLU measure general knowledge and HumanEval measures coding ability,
      chess provides a unique lens into <strong className="text-white">spatial reasoning</strong>,
      <strong className="text-white"> rule adherence</strong>, and <strong className="text-white">strategic planning</strong>.
    </p>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-white/60 font-medium">Benchmark</th>
            <th className="text-left py-3 px-4 text-white/60 font-medium">Measures</th>
            <th className="text-left py-3 px-4 text-white/60 font-medium">Limitation</th>
          </tr>
        </thead>
        <tbody className="text-white/50">
          <tr className="border-b border-white/5">
            <td className="py-3 px-4 text-white font-medium">MMLU</td>
            <td className="py-3 px-4">General knowledge (57 subjects)</td>
            <td className="py-3 px-4">Multiple choice format, memorization</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-3 px-4 text-white font-medium">HumanEval</td>
            <td className="py-3 px-4">Code generation from docstrings</td>
            <td className="py-3 px-4">Python-focused, short functions</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-3 px-4 text-white font-medium">ARC</td>
            <td className="py-3 px-4">Science reasoning (grade school)</td>
            <td className="py-3 px-4">Limited to science domain</td>
          </tr>
          <tr className="border-b border-white/5 bg-emerald-500/5">
            <td className="py-3 px-4 text-emerald-400 font-semibold">Motia Chess Index</td>
            <td className="py-3 px-4 text-white/70">Rule adherence, tactics, strategy</td>
            <td className="py-3 px-4 text-white/70">Chess-specific domain</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
      <p className="text-sm text-emerald-400/80">
        <strong>Key insight:</strong> Chess requires strict rule following with zero tolerance for errors —
        a single illegal move loses the game. This makes it an excellent test for LLM reliability and precision.
      </p>
    </div>
  </div>
)

export const MethodologyPage = () => {
  usePageTitle('Methodology')

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold text-white mb-4">Benchmark Methodology</h1>
          <p className="text-lg text-white/50">
            Technical details on how the Motia Chess Index and component scores are calculated.
          </p>
        </div>

        {/* Visual flow diagram */}
        <BenchmarkFlowDiagram />

        {/* Comparison with other benchmarks */}
        <BenchmarkComparisonSection />

        <DetailSection 
          title="1. Legal Move Benchmark" 
          icon={<ShieldCheck />}
        >
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              This benchmark measures a model's ability to strictly adhere to the rules of chess.
              We present the model with a series of game positions (FEN strings) and ask it to list <strong>every single legal move</strong> available.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <h3 className="text-white font-semibold mb-2 text-sm">Metrics</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-white/50">
                  <li><strong>Precision:</strong> (Correct Moves / Total Generated)</li>
                  <li><strong>Recall:</strong> (Correct Moves / Actual Legal Moves)</li>
                  <li><strong>Score:</strong> F1-Score (Harmonic mean of P & R)</li>
                </ul>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <h3 className="text-white font-semibold mb-2 text-sm">Prompt Strategy</h3>
                <p className="text-sm text-white/50">
                  Models are prompted with the PGN context and current FEN. They must output a JSON array of SAN strings. 
                  We handle various JSON formatting errors gracefully to focus on chess capability.
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection 
          title="2. Puzzle Benchmark" 
          icon={<Brain />}
        >
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              Measures tactical sharpness. We source puzzles from the Lichess database, specifically filtering for 
              <strong> Mate-in-1</strong> and <strong>short tactical sequences</strong>.
            </p>
            <p>
              The model is given the position and asked for the "best move". 
            </p>
             <div className="bg-black/20 p-4 rounded-xl border border-white/5 mt-4">
                <h3 className="text-white font-semibold mb-2 text-sm">Scoring</h3>
                <p className="text-sm text-white/50">
                  <strong>Accuracy %:</strong> The model gets 1 point if its generated move matches the solution move exactly. 
                  0 points otherwise. No partial credit.
                </p>
              </div>
          </div>
        </DetailSection>

        <DetailSection 
          title="3. Average Centipawn Loss (ACPL)" 
          icon={<Activity />}
        >
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              Evaluates the strategic quality of moves played in the Arena. 
              We use <strong>Stockfish 16</strong> (depth 18+) to evaluate every move played by the AI.
            </p>
            <p>
              <em>Centipawn Loss (CPL)</em> is the difference in evaluation between the engine's best move and the move actually played.
            </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <h3 className="text-white font-semibold mb-2 text-sm">Formula</h3>
                <code className="block text-xs font-mono text-emerald-400 bg-black/40 p-2 rounded mb-2">
                  ACPL = Σ (BestEval - PlayedEval) / NumMoves
                </code>
                <p className="text-xs text-white/50">
                  Lower is better. A grandmaster might have 15-20 ACPL. A beginner &gt;100.
                </p>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                 <h3 className="text-white font-semibold mb-2 text-sm">Visualization</h3>
                 <p className="text-sm text-white/50">
                    On our charts, we invert this score (100 - ACPL, clamped at 0) so that 
                    "higher bars" always mean "better performance", maintaining consistency with other metrics.
                 </p>
              </div>
            </div>
          </div>
        </DetailSection>

        <div className="border-t border-white/10 pt-8 mt-12 text-center">
           <h2 className="text-white font-semibold mb-2">Reproducibility</h2>
           <p className="text-white/50 text-sm max-w-2xl mx-auto">
             All benchmarks are open source. You can run them yourself using the 
             <code className="bg-white/10 px-1 py-0.5 rounded text-white/80 mx-1">motia</code> CLI and the provided
             API scripts in the <a href="https://github.com/MotiaDev/chessarena-ai" className="text-emerald-400 hover:underline">GitHub repository</a>.
           </p>
        </div>

      </div>
    </Layout>
  )
}
