import { LeaderboardSchema } from '@chessarena/types/leaderboard'
import type { StreamConfig } from 'motia'

export const config: StreamConfig = {
  name: 'chessLeaderboard',
  schema: LeaderboardSchema,
  baseConfig: { storageType: 'default' },
}
