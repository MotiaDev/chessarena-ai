import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from './env'
import type { GameWithRole } from './types'

export const useGetGame = (gameId: string, password?: string) => {
  const [game, setGame] = useState<GameWithRole | undefined>()

  const getGame = useCallback(async (gameId: string, password?: string) => {
    const res = await fetch(`${apiUrl}/chess/game/${gameId}?password=${password ?? ''}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return undefined
    }

    const game = await res.json()
    setGame(game)
  }, [])

  useEffect(() => {
    getGame(gameId, password).catch(() => void 0)
  }, [gameId, password, getGame])

  return game
}
