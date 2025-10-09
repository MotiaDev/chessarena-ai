import { FlowContextStateStreams, Logger } from 'motia'
import { createGameId } from './create-game-id'
import { Game } from '@chessarena/types/game'
import { models } from '../ai/models'
import { isAiGame } from './utils'
import { User } from '@chessarena/types/user'

export const createGame = async (
  players: Game['players'],
  streams: FlowContextStateStreams,
  logger: Logger,
  user?: User,
): Promise<Game> => {
  const gameId = await createGameId({ streams, logger })

  const game = await streams.chessGame.set('game', gameId, {
    id: gameId,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'white',
    status: 'pending',
    players: {
      white: { ...players.white, userId: players.white.ai ? undefined : user?.id },
      black: { ...players.black, userId: players.black.ai },
    },
    check: false,
  })

  if (isAiGame(game) && players.white.ai && players.black.ai) {
    await streams.chessLiveAiGames.set('game', gameId, {
      id: gameId,
      createdAt: new Date().toISOString(),
      gameId,
      players: {
        white: {
          provider: players.white.ai,
          model: players.white.model ?? models[players.white.ai],
        },
        black: {
          provider: players.black.ai,
          model: players.black.model ?? models[players.black.ai],
        },
      },
    })
  }

  return game
}
