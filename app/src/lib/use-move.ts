import type { Role } from 'chessground/types'
import { type Key } from 'react'
import { apiClient } from './auth/api-client'

type Args = {
  gameId: string
}

export const useMove = ({ gameId }: Args) => {
  const move = async (from: Key, to: Key, promote?: Role) => {
    await apiClient.post(`/chess/game/${gameId}/move`, { from, to, promote })
  }

  return move
}
