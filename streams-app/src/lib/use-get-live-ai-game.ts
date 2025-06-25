import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { apiUrl } from './env'

export type AiModel = 'openai' | 'gemini' | 'claude'

export const useGetLiveAiGame = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const getLiveAiGame = useCallback(
    async (white: AiModel, black: AiModel) => {
      setIsLoading(true)

      try {
        const res = await fetch(`${apiUrl}/chess/get-live-ai-game`, {
          method: 'POST',
          body: JSON.stringify({ players: [white, black] }),
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          return undefined
        }

        const game = await res.json()
        navigate(`/game/${game.id}`)
      } finally {
        setIsLoading(false)
      }
    },
    [navigate],
  )

  return { getLiveAiGame, isLoading }
}
