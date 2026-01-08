import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  Download,
  Trophy,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import { Chessground } from '@/components/chess/chessground'
import { usePageTitle } from '@/lib/use-page-title'
import { useGameHistoryDetail } from '@/lib/use-game-history'
import { AiIcon } from '@/components/chess/ai-icon'
import { cn } from '@/lib/utils'
import type { AiModelProvider } from '@chessarena/types/ai-models'
import type { Key } from '@lichess-org/chessground/types'

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const GameReplayPage = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  usePageTitle('Game Replay')

  const { game, loading, error } = useGameHistoryDetail(gameId || null)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showMessages, setShowMessages] = useState(true)

  const currentFen = useMemo(() => {
    if (!game || currentMoveIndex < 0) return INITIAL_FEN
    return game.moves[currentMoveIndex]?.fenAfter || INITIAL_FEN
  }, [game, currentMoveIndex])

  const currentMove = useMemo(() => {
    if (!game || currentMoveIndex < 0) return null
    return game.moves[currentMoveIndex]
  }, [game, currentMoveIndex])

  const lastMoveHighlight = useMemo((): [Key, Key] | undefined => {
    if (!currentMove) return undefined
    return currentMove.lastMove as [Key, Key]
  }, [currentMove])



  const currentThought = useMemo(() => {
    if (!game || currentMoveIndex < 0) return null
    const moveColor = game.moves[currentMoveIndex]?.color
    const relevantMessages = game.messages.filter((m) => m.role === moveColor)
    const messageIndex = Math.floor(currentMoveIndex / 2) + (moveColor === 'black' ? 0 : 0)
    return relevantMessages[messageIndex] || null
  }, [game, currentMoveIndex])

  // Auto-play
  useEffect(() => {
    if (!isPlaying || !game) return

    const interval = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        if (prev >= game.moves.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, game])

  const goToStart = () => {
    setCurrentMoveIndex(-1)
    setIsPlaying(false)
  }

  const goToEnd = () => {
    if (game) {
      setCurrentMoveIndex(game.moves.length - 1)
      setIsPlaying(false)
    }
  }

  const goBack = () => {
    setCurrentMoveIndex((prev) => Math.max(-1, prev - 1))
  }

  const goForward = () => {
    if (game) {
      setCurrentMoveIndex((prev) => Math.min(game.moves.length - 1, prev + 1))
    }
  }

  const handleDownloadPgn = () => {
    if (!game?.pgn) return
    const blob = new Blob([game.pgn], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chessarena-${game.id}.pgn`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-white/60">Loading game...</div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <div className="text-white/60">{error || 'Game not found'}</div>
        <button
          onClick={() => navigate('/history')}
          className="text-white/40 hover:text-white transition-colors"
        >
          Back to History
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>History</span>
          </button>
          <div className="flex items-center gap-4">
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
            <button
              onClick={handleDownloadPgn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
            >
              <Download size={16} />
              PGN
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Board Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Players */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {game.blackPlayer.provider ? (
                  <>
                    <div className="bg-white rounded-full p-1.5">
                      <AiIcon ai={game.blackPlayer.provider as AiModelProvider} color="black" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {game.blackPlayer.provider}
                        {game.winner === 'black' && <Trophy size={14} className="text-yellow-500" />}
                      </div>
                      <div className="text-white/40 text-sm">{game.blackPlayer.model}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-white">Human (Black)</div>
                )}
                {game.blackIllegalMoves > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 text-sm">
                    <AlertTriangle size={14} />
                    {game.blackIllegalMoves}
                  </span>
                )}
              </div>
            </div>

            {/* Chess Board */}
            <div className="aspect-square max-w-[600px] mx-auto">
              <Chessground
                config={{
                  fen: currentFen,
                  lastMove: lastMoveHighlight,
                  check: currentMove?.check ? (currentMove.color === 'white' ? 'black' : 'white') : undefined,
                  viewOnly: true,
                  coordinates: true,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {game.whitePlayer.provider ? (
                  <>
                    <div className="bg-white rounded-full p-1.5">
                      <AiIcon ai={game.whitePlayer.provider as AiModelProvider} color="black" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {game.whitePlayer.provider}
                        {game.winner === 'white' && <Trophy size={14} className="text-yellow-500" />}
                      </div>
                      <div className="text-white/40 text-sm">{game.whitePlayer.model}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-white">Human (White)</div>
                )}
                {game.whiteIllegalMoves > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 text-sm">
                    <AlertTriangle size={14} />
                    {game.whiteIllegalMoves}
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={goToStart}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronsLeft size={24} />
              </button>
              <button
                onClick={goBack}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={goForward}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={goToEnd}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronsRight size={24} />
              </button>
            </div>

            <div className="text-center text-white/40 text-sm">
              Move {currentMoveIndex + 1} of {game.moves.length}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Move List */}
            <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-white font-medium">Moves</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-1">
                  {game.moves.map((move, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMoveIndex(idx)}
                      className={cn(
                        'px-2 py-1 text-sm rounded text-left transition-colors',
                        currentMoveIndex === idx
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {move.color === 'white' && (
                        <span className="text-white/40 mr-1">{Math.floor(idx / 2) + 1}.</span>
                      )}
                      {move.lastMove.join('-')}
                      {move.check && '+'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="w-full px-4 py-3 border-b border-white/10 flex items-center justify-between"
              >
                <h3 className="text-white font-medium flex items-center gap-2">
                  <MessageSquare size={16} />
                  AI Reasoning
                </h3>
                <ChevronRight
                  size={16}
                  className={cn('text-white/40 transition-transform', showMessages && 'rotate-90')}
                />
              </button>
              {showMessages && (
                <div className="p-4 max-h-[400px] overflow-y-auto">
                  {currentThought ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <span className={currentThought.role === 'white' ? 'text-white' : 'text-white/60'}>
                          {currentThought.sender}
                        </span>
                        {currentThought.moveSan && (
                          <span className="bg-white/10 px-1.5 py-0.5 rounded">
                            {currentThought.moveSan}
                          </span>
                        )}
                        {currentThought.isIllegalMove && (
                          <span className="text-red-500 text-xs">Illegal</span>
                        )}
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{currentThought.message}</p>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">Select a move to see AI reasoning</p>
                  )}
                </div>
              )}
            </div>

            {/* Game Result */}
            {game.endGameReason && (
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Result</h3>
                <p className="text-white/60 text-sm">{game.endGameReason}</p>
                {game.winner && (
                  <p className="text-white/40 text-sm mt-1">
                    Winner: <span className="text-white">{game.winner}</span>
                  </p>
                )}
              </div>
            )}

            {/* Scoreboard */}
            {game.scoreboard && (
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Score</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-white/40 mb-1">White</div>
                    <div className="text-white">{game.scoreboard.white.finalCentipawnScore} cp</div>
                    <div className="text-white/40 text-xs mt-1">
                      {game.scoreboard.white.blunders} blunders
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">Black</div>
                    <div className="text-white">{game.scoreboard.black.finalCentipawnScore} cp</div>
                    <div className="text-white/40 text-xs mt-1">
                      {game.scoreboard.black.blunders} blunders
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
