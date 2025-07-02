import { Chess } from 'chess.js'
import { Emitter, FlowContextStateStreams, Logger } from 'motia'
import type { Game } from '../../steps/chess/streams/00-chess-game.stream'
import { getCaptureScore } from './get-capture-score'
import { evaluateMove } from './evaluate-move'

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
        data: { 
          gameId: string; 
          player: string; 
          move: { 
            from: string; 
            to: string; 
            captured?: { 
              type: string; 
              square: string 
            } 
          }; 
          fenBefore: string 
        }
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
  const pieceCaptured = move?.captured ? {
    piece: move.captured,
    score: getCaptureScore(move.captured)
  } : undefined
  const isPawnPromotion = move?.promotion !== undefined
  
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
      [player]: { 
        ...game.players[player], 
        illegalMoveAttempts: nextIllegalMoveAttempts,
        totalMoves: (game.players[player]?.totalMoves ?? 0) + 1,
        captures: pieceCaptured ? [...(game.players[player].captures ?? []), pieceCaptured] : game.players[player].captures,
        promotions: isPawnPromotion ? (game.players[player].promotions ?? 0) + 1 : game.players[player].promotions,
      },
    },
    check: chess.inCheck(),
    allMoves: [...(game.allMoves ?? []), {move, ...evaluateMove(chess, move)}],  
  })

  if (status === 'pending') {
    await emit({
      topic: 'chess-game-moved',
      data: {
        gameId,
        player,
        fenBefore: game.fen,
        move: { 
          from: action.from, 
          to: action.to,
        },
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
