import { useCallback } from 'react'
import type { Game, Password, Players } from '../components/chess/types'
import { apiUrl } from './env'

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
