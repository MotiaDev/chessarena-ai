import { useCallback, useEffect, useState } from 'react'
import { apiClient } from './auth/api-client'
import type { GameWithRole } from './types'

export const useGetGame = (gameId: string) => {
  const [game, setGame] = useState<GameWithRole | undefined>()

  const getGame = useCallback(async (gameId: string) => {
    const data = await apiClient.get<GameWithRole>(`/chess/game/${gameId}`)
    setGame(data)
  }, [])

  useEffect(() => {
    getGame(gameId).catch(() => void 0)
  }, [gameId, getGame])

  return game
}
