import { StreamConfig } from 'motia'
import { PuzzleBenchmarkSummarySchema } from '@chessarena/types/puzzle-benchmark'

export const config: StreamConfig = {
  name: 'puzzleBenchmarkSummary',
  schema: PuzzleBenchmarkSummarySchema,
  baseConfig: { storageType: 'default' },
}
