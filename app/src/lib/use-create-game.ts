import type { Game } from '@chessarena/types/game'
import { apiClient } from './auth/api-client'
import type { Players } from './types'

export const useCreateGame = () => {
  const createGame = async (players: Players): Promise<Game> => apiClient.post<Game>('/chess/create-game', { players })

  return createGame
}
