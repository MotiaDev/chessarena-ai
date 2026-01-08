import { StreamConfig } from 'motia'
import { PositionSetSchema } from '@chessarena/types/legal-move-benchmark'

export const config: StreamConfig = {
  name: 'positionSet',
  schema: PositionSetSchema,
  baseConfig: { storageType: 'default' },
}
