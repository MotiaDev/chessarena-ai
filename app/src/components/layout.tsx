import { cn } from '@/lib/utils'
import { BarChart3, Trophy, BookOpen } from 'lucide-react'

type LayoutProps = {
  children: React.ReactNode
  leftPanel?: React.ReactNode
}

export const Layout = ({ children, leftPanel }: LayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(50%,1fr)_minmax(auto,500px)] h-dvh bg-image-landing">
      {/* Left Panel - Hidden on mobile, blends with background */}
      <div className="hidden md:flex md:flex-col p-6 overflow-y-auto">
        {leftPanel}
      </div>

      {/* Right Panel - Glassmorphism overlay */}
      <div className="flex flex-col w-full h-full p-6 gap-6 md:col-start-2 md:border-l-2 md:border-white/5 bg-background/60 md:bg-background/35 backdrop-blur-lg overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

// Sidebar with tabs for the left panel - designed to blend with bg-image-landing
type SidebarPanelProps = {
  activeTab: 'benchmarks' | 'leaderboard' | 'methodology'
  onTabChange: (tab: 'benchmarks' | 'leaderboard' | 'methodology') => void
  children: React.ReactNode
}

export const SidebarPanel = ({ activeTab, onTabChange, children }: SidebarPanelProps) => {
  return (
    <div className="flex flex-col h-full max-h-[min(calc(100dvh-48px),1280px)] my-auto mx-auto w-full max-w-[650px]">
      {/* Header with subtle branding */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <img src="/motia.png" alt="" className="w-6 h-6 opacity-70" />
          <span className="text-xs font-bold tracking-[0.15em] text-white/60 uppercase">Chess Bench</span>
        </div>
        <span className="text-[10px] text-white/30 font-mono">v1.0</span>
      </div>

      {/* Tabs - Pill style that blends with the background */}
      <div className="flex items-center gap-1.5 mb-4">
        <TabButton
          active={activeTab === 'benchmarks'}
          onClick={() => onTabChange('benchmarks')}
          icon={<BarChart3 size={14} />}
          label="Benchmarks"
        />
        <TabButton
          active={activeTab === 'leaderboard'}
          onClick={() => onTabChange('leaderboard')}
          icon={<Trophy size={14} />}
          label="Arena"
        />
        <TabButton
          active={activeTab === 'methodology'}
          onClick={() => onTabChange('methodology')}
          icon={<BookOpen size={14} />}
          label="Methodology"
        />
      </div>

      {/* Tab Content - Semi-transparent panel */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-md shadow-2xl shadow-black/20">
        <div className="h-full overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-white/25">
        <span>Powered by</span>
        <a href="https://motia.dev" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white/60 transition-colors font-medium">
          Motia
        </a>
      </div>
    </div>
  )
}

// Tab button component
type TabButtonProps = {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
      active
        ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-black/10'
        : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
    )}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
)
