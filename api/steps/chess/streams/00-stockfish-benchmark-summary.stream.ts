import { StreamConfig } from 'motia'
import { StockfishBenchmarkSummarySchema } from '@chessarena/types/stockfish-benchmark'

export const config: StreamConfig = {
  name: 'stockfishBenchmarkSummary',
  schema: StockfishBenchmarkSummarySchema,
  baseConfig: { storageType: 'default' },
}
