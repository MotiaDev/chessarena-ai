import { useCallback, useState } from 'react'
import { apiUrl } from './env'

export type AiModel = 'openai' | 'gemini' | 'claude'

export const useGetLiveAiGame = () => {
  const [isLoading, setIsLoading] = useState(false)
  const getLiveAiGame = useCallback(async (white: AiModel, black: AiModel) => {
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

      return await res.json()
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { getLiveAiGame, isLoading }
}
