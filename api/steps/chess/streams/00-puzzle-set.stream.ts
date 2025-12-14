import { StreamConfig } from 'motia'
import { PuzzleSetSchema } from '@chessarena/types/puzzle-benchmark'

export const config: StreamConfig = {
  name: 'puzzleSet',
  schema: PuzzleSetSchema,
  baseConfig: { storageType: 'default' },
}
