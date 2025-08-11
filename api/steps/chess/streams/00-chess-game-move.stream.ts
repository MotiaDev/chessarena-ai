import { GameMoveSchema } from '@chessarena/types/game-move'
import { StreamConfig } from 'motia'

export const config: StreamConfig = {
  name: 'chessGameMove',
  schema: GameMoveSchema,
  baseConfig: { storageType: 'default' },
}
