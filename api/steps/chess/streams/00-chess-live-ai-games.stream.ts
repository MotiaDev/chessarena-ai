import { LiveAiGamesSchema } from '@chessarena/types/live-ai-games'
import type { StreamConfig } from 'motia'

export const config: StreamConfig = {
  name: 'chessLiveAiGames',
  schema: LiveAiGamesSchema,
  baseConfig: { storageType: 'default' },
}
