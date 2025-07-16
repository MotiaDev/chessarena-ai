import { ChessGame } from '@/components/chess/chess-game'
import { Page } from '@/components/page'
import { useGetLiveAiGame, type AiModel } from '@/lib/use-get-live-ai-game'
import { usePageTitle } from '@/lib/use-page-title'
import { useTrackEvent } from '@/lib/use-track-event'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

export const AiGamePage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getLiveAiGame, isLoading } = useGetLiveAiGame()
  const [gameId, setGameId] = useState<string>()
  const [error, setError] = useState<string>()
  const trackEvent = useTrackEvent()

  usePageTitle('AI Game')

  useEffect(() => {
    if (!id) {
      setError('Invalid game ID')
      return
    }

    const [white, black] = id.split('-vs-') as [AiModel, AiModel]

    getLiveAiGame(white, black) //
      .then((game) => {
        if (!game) setError('Game not found')
        else {
          trackEvent('ai_game_loaded', {
            game_id: game.id,
            white_model: white,
            black_model: black,
          })
          setGameId(game.id)
          setError(undefined)
        }
      })
  }, [getLiveAiGame, id, trackEvent])

  if (gameId) {
    return (
      <Page className="w-screen">
        <ChessGame gameId={gameId!} onClose={() => navigate('/')} />
      </Page>
    )
  }

  return (
    <Page className="w-screen h-screen flex flex-col items-center justify-center">
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Loader2 className="size-10 animate-spin" />
        </div>
      )}

      {error && <div className="w-full font-medium text-lg text-white text-center">{error}</div>}
    </Page>
  )
}
