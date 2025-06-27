import { Chess } from 'chess.js'
import { Emitter, FlowContextStateStreams, Logger } from 'motia'
import type { Game } from '../../steps/chess/streams/00-chess-game.stream'

type Args = {
  logger: Logger
  streams: FlowContextStateStreams
  gameId: string
  game: Game
  action: { from: string; to: string; promote?: 'queen' | 'rook' | 'bishop' | 'knight' }
  player: 'white' | 'black'
  emit: Emitter<
    | {
        topic: 'chess-game-moved'
        data: { gameId: string; player: string; move: { from: string; to: string }; fenBefore: string }
      }
    | { topic: 'chess-game-ended'; data: { gameId: string; player: string } }
  >
}

export const move = async ({ logger, streams, gameId, game, action, emit, player }: Args): Promise<Game> => {
  const chess = new Chess(game.fen)
  const color = chess.turn() === 'b' ? 'black' : 'white'

  if (player !== color) {
    logger.error('Invalid player', { player, color })
    throw new Error('Invalid player')
  }

  const move = chess.move({ from: action.from, to: action.to, promotion: action.promote?.charAt(0) })
  const status = chess.isDraw() ? 'draw' : chess.isGameOver() ? 'completed' : 'pending'
  const newGame = await streams.chessGame.set('game', gameId, {
    id: gameId,
    fen: move.after,
    status,
    winner: status === 'completed' ? (chess.isCheckmate() ? player : undefined) : undefined,
    turn: player === 'white' ? 'black' : 'white',
    lastMove: [move.from, move.to],
    players: game.players,
    check: chess.inCheck(),
  })

  if (status === 'pending') {
    await emit({
      topic: 'chess-game-moved',
      data: {
        gameId,
        player,
        fenBefore: game.fen,
        move: { from: action.from, to: action.to },
      },
    })
  } else {
    await emit({
      topic: 'chess-game-ended',
      data: {
        gameId,
        player,
      },
    })
  }

  return newGame
}
