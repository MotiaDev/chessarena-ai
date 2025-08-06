import type { Role } from 'chessground/types'
import { useCallback, type Key } from 'react'
import { apiUrl } from './env'

type Args = {
  gameId: string
}

export const useMove = ({ gameId }: Args) => {
  const move = useCallback(async (from: Key, to: Key, password: string, promote?: Role) => {
    const res = await fetch(`${apiUrl}/chess/game/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({
        from,
        to,
        password,
        promote,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    return res.ok
  }, [])

  return move
}


export const useRetryMove = ({ gameId }: Args) => {
  const retryMove = useCallback(async () => {
    const res = await fetch(`${apiUrl}/chess/game/${gameId}/retry-last-move`, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    return res.ok
  }, [])

  return retryMove
}