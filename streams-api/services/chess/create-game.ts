import { FlowContextStateStreams, Logger } from 'motia'
import { createGameId } from './create-game-id'
import { Game } from '../../steps/chess/streams/00-chess-game.stream'

export const createGame = async (
  players: Game['players'],
  streams: FlowContextStateStreams,
  logger: Logger,
): Promise<Game> => {
  const gameId = await createGameId({ streams, logger })

  return streams.chessGame.set('game', gameId, {
    id: gameId,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'white',
    status: 'pending',
    players,
    check: false,
  })
}
