import { Github, LogIn, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { usePageTitle } from '@/lib/use-page-title'
import { useAuth } from '@/lib/auth/use-auth'
import { Leaderboard } from '@/components/leaderboard/leaderboard'

export const LandingPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  usePageTitle('LLM Chess Benchmark')

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/motia.png" alt="" className="w-6 h-6" />
              <span className="text-sm font-medium tracking-[0.2em] text-white/80">CHESS ARENA</span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden sm:flex items-center gap-4 text-sm text-white/50">
                <button onClick={() => navigate('/methodology')} className="hover:text-white transition-colors">
                  Methodology
                </button>
                <button onClick={() => navigate('/history')} className="hover:text-white transition-colors">
                  History
                </button>
                <button onClick={() => navigate('/live-matches')} className="hover:text-white transition-colors">
                  Live
                </button>
                <a href="https://github.com/MotiaDev/chessarena-ai" target="_blank" className="hover:text-white transition-colors">
                  <Github size={16} />
                </a>
              </nav>
              {user ? (
                <button onClick={logout} className="text-sm text-white/50 hover:text-white transition-colors">
                  Sign out
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <LogIn size={14} />
                  Sign in
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6">
          {/* Hero - Centered */}
          <section className="py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              LLM Chess Reasoning Benchmark
            </h1>
            <p className="text-white/50 text-lg mb-4 max-w-xl mx-auto">
              Evaluating how well language models understand chess rules and strategy.
            </p>
            <p className="text-white/40 text-sm mb-8 max-w-lg mx-auto">
              Models are tested on legal move generation and move quality using Stockfish. 
              Two variants: <span className="text-emerald-400/80">Guided</span> (legal moves provided) 
              and <span className="text-amber-400/80">Unguided</span> (FEN only).
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/new')}
                className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Create Game
              </button>
              <button
                onClick={() => navigate('/methodology')}
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
              >
                Methodology <ChevronRight size={14} />
              </button>
            </div>
          </section>

          {/* Leaderboard - Centered */}
          <section className="pb-16">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Model Rankings</h2>
              <p className="text-sm text-white/40">Sorted by win rate across all games</p>
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.01]">
              <Leaderboard />
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 border-t border-white/10 text-center text-sm text-white/30">
            <div className="flex items-center justify-center gap-4 mb-2">
              <a href="/about" className="hover:text-white/50 transition-colors">About</a>
              <span>·</span>
              <a href="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy</a>
              <span>·</span>
              <a href="https://github.com/MotiaDev/chessarena-ai" target="_blank" className="hover:text-white/50 transition-colors">GitHub</a>
            </div>
            <p>Built with <a href="https://motia.dev" target="_blank" className="hover:text-white/50 transition-colors">Motia</a></p>
          </footer>
        </main>
      </div>
    </div>
  )
}
