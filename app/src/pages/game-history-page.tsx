import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Download, Filter, Clock, Trophy, AlertTriangle, ChevronRight } from 'lucide-react'
import { usePageTitle } from '@/lib/use-page-title'
import { useGameHistory } from '@/lib/use-game-history'
import { AiIcon } from '@/components/chess/ai-icon'
import { cn } from '@/lib/utils'
import type { BenchmarkVariant } from '@chessarena/types/game'
import type { AiModelProvider } from '@chessarena/types/ai-models'

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const GameHistoryPage = () => {
  const navigate = useNavigate()
  usePageTitle('Game History')

  const { games, total, loading, filter, updateFilter } = useGameHistory({ limit: 20 })
  const [showFilters, setShowFilters] = useState(false)

  const handleExport = (format: 'json' | 'csv') => {
    const params = new URLSearchParams()
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    params.append('format', format)
    window.open(`${import.meta.env.VITE_API_URL}/chess/history/export?${params.toString()}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10">
        <header className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-lg font-semibold text-white">Game History</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  showFilters ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                )}
              >
                <Filter size={16} />
                Filters
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
              >
                <Download size={16} />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
              >
                <Download size={16} />
                JSON
              </button>
            </div>
          </div>
        </header>

        {showFilters && (
          <div className="border-b border-white/10 bg-white/[0.02]">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4">
              <select
                value={filter.variant || ''}
                onChange={(e) => updateFilter({ variant: e.target.value as BenchmarkVariant || undefined })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">All Variants</option>
                <option value="guided">Guided</option>
                <option value="unguided">Unguided</option>
              </select>

              <select
                value={filter.status || ''}
                onChange={(e) => updateFilter({ status: e.target.value as 'completed' | 'draw' | 'endedEarly' || undefined })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">All Outcomes</option>
                <option value="completed">Completed</option>
                <option value="draw">Draw</option>
                <option value="endedEarly">Ended Early</option>
              </select>

              <select
                value={filter.winner || ''}
                onChange={(e) => updateFilter({ winner: e.target.value as 'white' | 'black' || undefined })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Any Winner</option>
                <option value="white">White Won</option>
                <option value="black">Black Won</option>
              </select>

              <button
                onClick={() => updateFilter({ variant: undefined, status: undefined, winner: undefined })}
                className="text-white/40 hover:text-white text-sm transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-4 text-white/40 text-sm">{total} games found</div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              No games found. Play some games to see them here!
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => navigate(`/history/${game.id}`)}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg p-4 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* White Player */}
                      <div className="flex items-center gap-2">
                        {game.whitePlayer.provider ? (
                          <>
                            <div className="bg-white rounded-full p-1">
                              <AiIcon ai={game.whitePlayer.provider as AiModelProvider} color="black" size={20} />
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{game.whitePlayer.provider}</div>
                              <div className="text-white/40 text-xs truncate max-w-[120px]">
                                {game.whitePlayer.model}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-white/60 text-sm">Human</div>
                        )}
                        {game.winner === 'white' && (
                          <Trophy size={14} className="text-yellow-500" />
                        )}
                      </div>

                      <span className="text-white/30">vs</span>

                      {/* Black Player */}
                      <div className="flex items-center gap-2">
                        {game.blackPlayer.provider ? (
                          <>
                            <div className="bg-white rounded-full p-1">
                              <AiIcon ai={game.blackPlayer.provider as AiModelProvider} color="black" size={20} />
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{game.blackPlayer.provider}</div>
                              <div className="text-white/40 text-xs truncate max-w-[120px]">
                                {game.blackPlayer.model}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-white/60 text-sm">Human</div>
                        )}
                        {game.winner === 'black' && (
                          <Trophy size={14} className="text-yellow-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-white/40 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(game.duration)}
                        </div>
                        <div>{game.totalMoves} moves</div>
                        {(game.whiteIllegalMoves > 0 || game.blackIllegalMoves > 0) && (
                          <div className="flex items-center gap-1 text-amber-500/70">
                            <AlertTriangle size={14} />
                            {game.whiteIllegalMoves + game.blackIllegalMoves}
                          </div>
                        )}
                      </div>

                      {/* Variant Badge */}
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          game.variant === 'unguided'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        )}
                      >
                        {game.variant}
                      </span>

                      {/* Date */}
                      <div className="text-white/30 text-sm w-32 text-right">{formatDate(game.endedAt)}</div>

                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                  </div>

                  {game.endGameReason && (
                    <div className="mt-2 text-white/30 text-xs">{game.endGameReason}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
