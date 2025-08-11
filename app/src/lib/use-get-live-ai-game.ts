import { useCallback, useState } from 'react'
import { apiUrl } from './env'
import type { AiModelProvider } from '@chessarena/types/ai-models'

export const useGetLiveAiGame = () => {
  const [isLoading, setIsLoading] = useState(false)
  const getLiveAiGame = useCallback(async (white: AiModelProvider, black: AiModelProvider) => {
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
