import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from './env'
import type { Password } from './types'

export const useGetGamePasswords = (gameId: string, password?: string) => {
  const [passwords, setPasswords] = useState<Password | undefined>()

  const getGamePasswords = useCallback(async (gameId: string, password: string) => {
    const res = await fetch(`${apiUrl}/chess/game/${gameId}/passwords?password=${password}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return undefined
    }

    const passwords = await res.json()
    setPasswords(passwords)
  }, [])

  useEffect(() => {
    if (!password) {
      setPasswords(undefined)
    } else {
      getGamePasswords(gameId, password).catch(() => void 0)
    }
  }, [gameId, password, getGamePasswords])

  return passwords
}
