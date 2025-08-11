import { StreamConfig } from 'motia'
import { LeaderboardSchema } from '@chessarena/types/leaderboard'

export const config: StreamConfig = {
  name: 'chessLeaderboard',
  schema: LeaderboardSchema,
  baseConfig: { storageType: 'default' },
}
