import type { LiveAiGames } from '@chessarena/types/live-ai-games'
import { cron, type Handlers, type StepConfig } from 'motia'

export const config = {
  name: 'PurgeStuckGames',
  description: 'Removes all games that have been stuck for more than 10 minutes',
  flows: ['chess'],
  triggers: [cron('0 0 * * * *')], // every hour
  enqueues: [],
  virtualEnqueues: [],
} as const satisfies StepConfig

const FIFTEEN_MINUTES = 1000 * 60 * 15

const shouldPurgeGame = (game: LiveAiGames) => {
  if (!game.createdAt) {
    return true
  }

  const createdAt = new Date(game.createdAt)
  const now = new Date()
  const diff = now.getTime() - createdAt.getTime()
  return diff > FIFTEEN_MINUTES
}

export const handler: Handlers<typeof config> = async (_input, { logger, streams }) => {
  logger.info('[PurgeStuckGames] Purge stuck games')

  const games = await streams.chessLiveAiGames.getGroup('game')

  for (const game of games) {
    if (shouldPurgeGame(game)) {
      logger.info('Removing stuck game', { gameId: game.id })
      await streams.chessLiveAiGames.delete('game', game.id)
    }
  }
}
