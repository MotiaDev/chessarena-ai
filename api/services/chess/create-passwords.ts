import type { Password } from '@chessarena/types/game'
import { InternalStateManager } from 'motia'

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const createPasswords = async (state: InternalStateManager, gameId: string): Promise<Password> => {
  const passwords: Password = {
    white: generatePassword(),
    black: generatePassword(),
    root: generatePassword(),
  }

  await state.set<Password>(gameId, 'passwords', passwords)

  return passwords
}
