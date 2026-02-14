import { GameMessageSchema } from '@chessarena/types/game-message'
import type { StreamConfig } from 'motia'

export const config: StreamConfig = {
  name: 'chessGameMessage',
  schema: GameMessageSchema,
  baseConfig: { storageType: 'default' },
}
