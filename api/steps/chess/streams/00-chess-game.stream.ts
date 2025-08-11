import { StreamConfig } from 'motia'
import { GameSchema } from '@chessarena/types/game'

export const config: StreamConfig = {
  name: 'chessGame',
  schema: GameSchema,
  baseConfig: { storageType: 'default' },
}
