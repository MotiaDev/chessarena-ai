import type { Game } from '@chessarena/types/game'
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'
import { Role } from './get-game-role'

type Args = {
  game: Game
  role: Role
}

export const getUserName = ({ game, role }: Args): string => {
  if (role === 'root') {
    return 'Root'
  } else if (role === 'spectator') {
    return uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ' })
  }

  return role === 'white' ? game.players.white.name : game.players.black.name
}
