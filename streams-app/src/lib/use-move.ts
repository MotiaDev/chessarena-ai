import { useCallback, type Key } from 'react'
import { apiUrl } from './env'

type Args = {
  gameId: string
}

export const useMove = ({ gameId }: Args) => {
  const move = useCallback(async (from: Key, to: Key, password: string) => {
    const res = await fetch(`${apiUrl}/chess/game/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ from, to, player: 'white', password }),
      headers: { 'Content-Type': 'application/json' },
    })

    return res.ok
  }, [])

  return move
}
