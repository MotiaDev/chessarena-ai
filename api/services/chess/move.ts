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
  illegalMoveAttempts?: number
  emit: Emitter<
    | {
        topic: 'chess-game-moved'
        data: { gameId: string; player: string; move: { from: string; to: string }; fenBefore: string }
      }
    | { topic: 'chess-game-ended'; data: { gameId: string } }
  >
}

export const move = async ({
  logger,
  streams,
  gameId,
  game,
  action,
  emit,
  player,
  illegalMoveAttempts = 0,
}: Args): Promise<Game> => {
  const chess = new Chess(game.fen)
  const color = chess.turn() === 'b' ? 'black' : 'white'

  if (player !== color) {
    logger.error('Invalid player', { player, color })
    throw new Error('Invalid player')
  }

  const turns = game.turns ?? 0
  const move = chess.move({ from: action.from, to: action.to, promotion: action.promote?.charAt(0) })
  const shouldBeDraw = turns >= 50
  const status = shouldBeDraw || chess.isDraw() ? 'draw' : chess.isGameOver() ? 'completed' : 'pending'
  const nextIllegalMoveAttempts = (game.players[player].illegalMoveAttempts ?? 0) + illegalMoveAttempts
  const endGameReason = chess.isCheckmate() ? 'Checkmate' : shouldBeDraw ? 'Draw' : undefined
  const newGame = await streams.chessGame.set('game', gameId, {
    id: gameId,
    fen: move.after,
    status,
    turns: turns + 1,
    winner: status === 'completed' ? (chess.isCheckmate() ? player : undefined) : undefined,
    turn: player === 'white' ? 'black' : 'white',
    lastMove: [move.from, move.to],
    endGameReason,
    players: {
      ...game.players,
      [player]: { ...game.players[player], illegalMoveAttempts: nextIllegalMoveAttempts },
    },
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
      data: { gameId },
    })
  }

  return newGame
}
