import { LiveAiGames } from '@chessarena/types/live-ai-games'
import { CronConfig, Handlers } from 'motia'

export const config: CronConfig = {
  cron: '0 0 * * * *', // every hour
  name: 'PurgeStuckGames',
  description: 'Removes all games that have been stuck for more than 10 minutes',
  type: 'cron',
  emits: [],
  flows: ['chess'],
}

const TEN_MINUTES = 1000 * 60 * 10

const shouldPurgeGame = (game: LiveAiGames) => {
  if (!game.createdAt) {
    return true
  }

  const createdAt = new Date(game.createdAt)
  const now = new Date()
  const diff = now.getTime() - createdAt.getTime()
  return diff > TEN_MINUTES
}

export const handler: Handlers['PurgeStuckGames'] = async ({ logger, streams }) => {
  logger.info('[PurgeStuckGames] Purge stuck games')

  const games = await streams.chessLiveAiGames.getGroup('game')

  for (const game of games) {
    if (shouldPurgeGame(game)) {
      logger.info('Removing stuck game', { gameId: game.id })
      await streams.chessLiveAiGames.delete('game', game.id)
    }
  }
}
