import { GameSchema } from '@chessarena/types/game'
import type { StreamConfig } from 'motia'

export const config: StreamConfig = {
  name: 'chessGame',
  schema: GameSchema,
  baseConfig: { storageType: 'default' },
}
