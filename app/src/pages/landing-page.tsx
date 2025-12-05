import { Trophy, FlaskConical, Play, Brain, Target, Github, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { usePageTitle } from '@/lib/use-page-title'
import { AuthContainer } from '@/components/auth/auth-container'
import { CreateGameButton } from '@/components/chess/create-game/create-game-button'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { BaseButton } from '@/components/ui/base-button'

const MetricBadge: React.FC<{ icon: React.ReactNode; label: string; description: string }> = ({
  icon,
  label,
  description,
}) => (
  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
    <div className="p-2 bg-white/10 rounded-lg text-emerald-400">{icon}</div>
    <div>
      <div className="text-white font-medium text-sm">{label}</div>
      <div className="text-white/50 text-xs">{description}</div>
    </div>
  </div>
)

export const LandingPage = () => {
  const navigate = useNavigate()

  usePageTitle('LLM Chess Benchmark')

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/motia.png" alt="ChessArena" className="w-8 h-8" />
            <span className="font-title text-white text-lg">ChessArena</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/MotiaDev/chessarena-ai"
              target="_blank"
              className="text-white/60 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <AuthContainer />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-emerald-400 text-sm font-medium">Open Source Benchmark</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-title text-white mb-6 leading-tight">
            Measuring LLM<br />Chess Reasoning
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
            Transparent, reproducible evaluation of how well language models understand chess rules and strategy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <CreateGameButton onClick={() => navigate('/new')} className="w-full sm:w-auto">
              Run Benchmark
            </CreateGameButton>
            <BaseButton 
              onClick={() => navigate('/methodology')} 
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10"
            >
              <FlaskConical size={18} />
              <span>View Methodology</span>
              <ArrowRight size={16} className="ml-1" />
            </BaseButton>
          </div>

          {/* Key Metrics Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <MetricBadge
              icon={<Target size={20} />}
              label="Legal Move Rate"
              description="Rule understanding"
            />
            <MetricBadge
              icon={<Brain size={20} />}
              label="Centipawn Loss"
              description="Move quality"
            />
            <MetricBadge
              icon={<Trophy size={20} />}
              label="Win Rate"
              description="Overall performance"
            />
            <MetricBadge
              icon={<FlaskConical size={20} />}
              label="Guided vs Unguided"
              description="Two test variants"
            />
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-title text-white">Model Rankings</h2>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              View Full Leaderboard <ArrowRight size={14} />
            </button>
          </div>
          <Leaderboard className="rounded-xl border border-white/10" />
        </section>

        {/* Quick Actions */}
        <section className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/live-matches')}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 text-left transition-all"
            >
              <div className="p-3 bg-white/10 rounded-lg w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Play size={24} className="text-white group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Live Matches</h3>
              <p className="text-white/50 text-sm">Watch AI models play against each other in real-time.</p>
            </button>
            
            <button
              onClick={() => navigate('/methodology')}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 text-left transition-all"
            >
              <div className="p-3 bg-white/10 rounded-lg w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <FlaskConical size={24} className="text-white group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Methodology</h3>
              <p className="text-white/50 text-sm">Learn how we evaluate models with full prompt transparency.</p>
            </button>
            
            <button
              onClick={() => navigate('/about')}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 text-left transition-all"
            >
              <div className="p-3 bg-white/10 rounded-lg w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Github size={24} className="text-white group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Open Source</h3>
              <p className="text-white/50 text-sm">Built with Motia. View source code and contribute.</p>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            Built with{' '}
            <a href="https://motia.dev" target="_blank" className="text-white/60 hover:text-white underline">
              Motia
            </a>
            {' '}•{' '}
            <a href="https://github.com/MotiaDev/chessarena-ai" target="_blank" className="text-white/60 hover:text-white underline">
              GitHub
            </a>
            {' '}•{' '}
            <a href="/privacy-policy" className="text-white/60 hover:text-white underline">
              Privacy
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}
