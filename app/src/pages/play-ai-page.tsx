import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
import { useAuth } from '@/lib/auth/use-auth'
import { apiClient } from '@/lib/auth/api-client'
import { cn } from '@/lib/utils'

type ColorChoice = 'white' | 'black' | 'random'

export const PlayAIPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ColorChoice>('random')
  const [error, setError] = useState<string | null>(null)

  usePageTitle('Play vs AI')

  const handlePlay = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('chessarena-redirect', '/play-ai')
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.post<{ game: { id: string }; opponent: { provider: string; model: string } }>(
        '/chess/play-vs-ai',
        { playerColor: selectedColor },
      )

      navigate(`/game/${data.game.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setIsLoading(false)
    }
  }

  const colorOptions: { value: ColorChoice; label: string; icon: string }[] = [
    { value: 'white', label: 'White', icon: '♔' },
    { value: 'random', label: 'Random', icon: '🎲' },
    { value: 'black', label: 'Black', icon: '♚' },
  ]

  return (
    <Page>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Play vs AI</h1>
            <p className="text-white/60">
              Challenge a randomly selected AI opponent. Cheaper models appear more often!
            </p>
          </div>

          {/* Color Selection */}
          <div className="space-y-4">
            <label className="text-white/80 text-sm font-medium">Choose your color</label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedColor(option.value)}
                  className={cn(
                    'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                    selectedColor === option.value
                      ? 'border-indigo-500 bg-indigo-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  )}
                >
                  <span className="text-3xl mb-1">{option.icon}</span>
                  <span className="text-white/80 text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={cn(
              'w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all',
              'bg-gradient-to-r from-indigo-600 to-purple-600',
              'hover:from-indigo-500 hover:to-purple-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-white shadow-lg'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Finding opponent...
              </span>
            ) : (
              'Find Opponent'
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-white font-medium mb-2">How it works</h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• You'll be matched against a random AI model</li>
              <li>• Cheaper/faster models have higher chance of selection</li>
              <li>• Premium models (GPT-5, Claude Opus) appear less often</li>
              <li>• AI will provide legal moves to help you play</li>
            </ul>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 rounded-lg font-medium text-white/60 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </Page>
  )
}
