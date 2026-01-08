import { StreamConfig } from 'motia'
import { PuzzleBenchmarkRunSchema } from '@chessarena/types/puzzle-benchmark'

export const config: StreamConfig = {
  name: 'puzzleBenchmark',
  schema: PuzzleBenchmarkRunSchema,
  baseConfig: { storageType: 'default' },
}
