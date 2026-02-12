import { getContext, type Streams } from 'motia'
import { isProfane } from 'no-profanity'

type Args = {
  streams: Streams
}

export const createGameId = async ({ streams }: Args): Promise<string> => {
  const { logger } = getContext()
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const segments = Array.from({ length: 3 }, () => {
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  })
  const gameId = segments.join('-')
  const result = await streams.chessGame.get('game', gameId)

  if (isProfane(gameId)) {
    logger.info('[CreateGame] Game ID is profane', { gameId })
    return createGameId({ streams })
  }

  if (result?.id) {
    logger.info('[CreateGame] Game ID already exists', { gameId })
    return createGameId({ streams })
  }

  return gameId
}
