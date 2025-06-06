import { Game } from '../../steps/chess/streams/00-chess-game.stream'
import { Password } from '../../steps/chess/types'

type Args = {
  game: Game
  password: string
  passwords: Password | undefined
}

export type Role = 'root' | 'white' | 'black' | 'spectator'

export const getGameRole = async ({ game, password, passwords }: Args): Promise<Role> => {
  let role: Role = 'spectator'

  if (!passwords || password === passwords.root) {
    if (game.players.white.ai && game.players.black.ai) {
      role = 'spectator'
    } else if (game.players.white.ai) {
      role = 'black'
    } else if (game.players.black.ai) {
      role = 'white'
    } else {
      role = 'root'
    }
  } else if (password === passwords.white) {
    role = 'white'
  } else if (password === passwords.black) {
    role = 'black'
  }

  return role
}
