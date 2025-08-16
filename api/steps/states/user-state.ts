import { InternalStateManager } from 'motia'
import type { User } from '@chessarena/types/user'

export class UserState {
  constructor(private readonly state: InternalStateManager) {}

  async getUser(id: string): Promise<User | null> {
    return this.state.get<User>('user', id)
  }

  async setUser(id: string, user: User) {
    await this.state.set('user', id, user)
  }

  async findUserById(id: string) {
    const user = await this.state.get('user', id)
    return user
  }
}
