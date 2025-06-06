import { FlowContextStateStreams, Logger } from 'motia'
import { isProfane } from 'no-profanity'

type Args = {
  streams: FlowContextStateStreams
  logger: Logger
}

export const createGameId = async ({ streams, logger }: Args): Promise<string> => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const segments = Array.from({ length: 3 }, () => {
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  })
  const gameId = segments.join('-')
  const result = await streams.chessGame.get('game', gameId)

  if (isProfane(gameId)) {
    logger.info('[CreateGame] Game ID is profane', { gameId })
    return createGameId({ streams, logger })
  }

  if (result?.id) {
    logger.info('[CreateGame] Game ID already exists', { gameId })
    return createGameId({ streams, logger })
  }

  return gameId
}
