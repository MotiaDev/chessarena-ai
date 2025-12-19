import React from 'react'
import { usePageTitle } from '@/lib/use-page-title'
import { Layout } from '@/components/layout'
import { ShieldCheck, Brain, Activity } from 'lucide-react'

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
