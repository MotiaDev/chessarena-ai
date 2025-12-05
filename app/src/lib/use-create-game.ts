import type { BenchmarkVariant, Game } from '@chessarena/types/game'
import { apiClient } from './auth/api-client'
import type { Players } from './types'

type CreateGameParams = {
  players: Players
  variant?: BenchmarkVariant
}

export const useCreateGame = () => {
  const createGame = async ({ players, variant = 'guided' }: CreateGameParams): Promise<Game> =>
    apiClient.post<Game>('/chess/create-game', { players, variant })

  return createGame
}
