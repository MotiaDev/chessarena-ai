import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'
import { Game } from '../../steps/chess/streams/00-chess-game.stream'
import { Role } from './get-game-role'

type Args = {
  game: Game
  role: Role
}

export const getUserName = ({ game, role }: Args): string => {
  if (role === 'root') {
    return 'Root'
  } else if (role === 'spectator') {
    return uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ' }).toLocaleUpperCase()
  }

  return role === 'white' ? game.players.white.name : game.players.black.name
}
