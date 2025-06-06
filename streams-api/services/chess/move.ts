import { Chess } from 'chess.js'
import { Emitter, FlowContextStateStreams } from 'motia'
import type { Game } from '../../steps/chess/streams/00-chess-game.stream'

type Args = {
  streams: FlowContextStateStreams
  gameId: string
  game: Game
  action: { from: string; to: string }
  player: 'white' | 'black'
  emit: Emitter<{
    topic: 'chess-game-moved'
    data: { gameId: string; player: string; move: { from: string; to: string }; fenBefore: string }
  }>
}

export const move = async ({ streams, gameId, game, action, emit, player }: Args): Promise<Game> => {
  const chess = new Chess(game.fen)
  const color = chess.turn() === 'b' ? 'black' : 'white'

  if (player !== color) {
    throw new Error('Invalid player')
  }

  const move = chess.move({ from: action.from, to: action.to })
  const newGame = await streams.chessGame.set('game', gameId, {
    id: gameId,
    fen: move.after,
    turn: player === 'white' ? 'black' : 'white',
    status: chess.isGameOver() ? 'completed' : 'pending',
    lastMove: [move.from, move.to],
    players: game.players,
    check: chess.inCheck(),
  })

  await emit({
    topic: 'chess-game-moved',
    data: {
      gameId,
      player,
      fenBefore: game.fen,
      move: { from: action.from, to: action.to },
    },
  })

  return newGame as Game // TODO type should be generated with enums correctly
}
