import { StreamConfig } from 'motia'
import { GameHistorySchema } from '@chessarena/types/game-history'

export const config: StreamConfig = {
  name: 'chessGameHistory',
  schema: GameHistorySchema,
  baseConfig: { storageType: 'default' },
}
