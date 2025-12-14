import { StreamConfig } from 'motia'
import { StockfishBenchmarkRunSchema } from '@chessarena/types/stockfish-benchmark'

export const config: StreamConfig = {
  name: 'stockfishBenchmark',
  schema: StockfishBenchmarkRunSchema,
  baseConfig: { storageType: 'default' },
}
