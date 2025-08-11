import { useCallback } from 'react'
import { apiUrl } from './env'
import type { Game, Password } from '@chessarena/types/game'
import type { Players } from './types'

export type CreatedGame = Game & { passwords: Password & { root: string } }

export const useCreateGame = () => {
  const createGame = useCallback(async (players: Players): Promise<CreatedGame> => {
    const res = await fetch(`${apiUrl}/chess/create-game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    })

    return res.json()
  }, [])

  return createGame
}
