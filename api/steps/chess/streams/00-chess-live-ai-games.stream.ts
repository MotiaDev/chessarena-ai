import { StreamConfig } from 'motia'
import { LiveAiGamesSchema } from '@chessarena/types/live-ai-games'

export const config: StreamConfig = {
  name: 'chessLiveAiGames',
  schema: LiveAiGamesSchema,
  baseConfig: { storageType: 'default' },
}
