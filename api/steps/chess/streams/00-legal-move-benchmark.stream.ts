import { StreamConfig } from 'motia'
import { LegalMoveBenchmarkRunSchema } from '@chessarena/types/legal-move-benchmark'

export const config: StreamConfig = {
  name: 'legalMoveBenchmark',
  schema: LegalMoveBenchmarkRunSchema,
  baseConfig: { storageType: 'default' },
}
