import { apiClient } from './auth/api-client'

type Args = {
  gameId: string
}

export const useMove = ({ gameId }: Args) => {
  const move = async (moveSan: string) => {
    await apiClient.post(`/chess/game/${gameId}/move`, { moveSan })
  }

  return move
}
