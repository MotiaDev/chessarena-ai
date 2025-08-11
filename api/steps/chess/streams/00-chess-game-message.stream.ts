import { StreamConfig } from 'motia'
import { GameMessageSchema } from '@chessarena/types/game-message'

export const config: StreamConfig = {
  name: 'chessGameMessage',
  schema: GameMessageSchema,
  baseConfig: { storageType: 'default' },
}
