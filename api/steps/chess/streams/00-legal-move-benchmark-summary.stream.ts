import { StreamConfig } from 'motia'
import { LegalMoveBenchmarkSummarySchema } from '@chessarena/types/legal-move-benchmark'

export const config: StreamConfig = {
  name: 'legalMoveBenchmarkSummary',
  schema: LegalMoveBenchmarkSummarySchema,
  baseConfig: { storageType: 'default' },
}
