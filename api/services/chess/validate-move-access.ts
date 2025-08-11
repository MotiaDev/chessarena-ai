import type { Game, Password } from '@chessarena/types/game'
import { InternalStateManager } from 'motia'

type Args = {
  state: InternalStateManager
  gameId: string
  game: Game
  password: string
}

export const validateMoveAccess = async ({ state, gameId, game, password }: Args): Promise<boolean> => {
  const passwords = await state.get<Password>(gameId, 'passwords')

  if (passwords) {
    const expectedPassword = game.turn === 'white' ? passwords.white : passwords.black

    if (![expectedPassword, passwords.root].includes(password)) {
      return false
    }
  }

  return true
}
