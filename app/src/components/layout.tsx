import { Link, useLocation } from 'react-router'
import { Github } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Methodology', path: '/methodology' },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] relative overflow-y-auto font-sans selection:bg-emerald-500/30">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <img src="/motia.png" alt="" className="w-7 h-7 opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-semibold tracking-widest text-white/90 group-hover:text-white transition-colors">
                  CHESSARENA
                </span>
              </Link>
              
              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <nav className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      path === item.path
                        ? 'text-white bg-white/10'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/MotiaDev/chessarena-ai"
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12">
          {children}
        </main>
      </div>
    </div>
  )
}
