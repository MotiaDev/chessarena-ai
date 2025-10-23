import type { Game } from '@chessarena/types/game'
import { Chess } from 'chess.js'
import { randomUUID } from 'crypto'
import { Emitter, FlowContextStateStreams, Logger } from 'motia'
import { getCaptureScore } from './get-capture-score'

type Args = {
  logger: Logger
  streams: FlowContextStateStreams
  gameId: string
  game: Game
  moveSan: string
  player: 'white' | 'black'
  illegalMoveAttempts?: number
  emit: Emitter<
    | {
        topic: 'chess-game-moved'
        data: {
          gameId: string
          player: string
          move: {
            from: string
            to: string
          }
          fenBefore: string
        }
      }
    | { topic: 'chess-game-ended'; data: { gameId: string } }
    | {
        topic: 'evaluate-player-move'
        data: {
          gameId: string
          fenBefore: string
          fenAfter: string
          moveId: string
          player: string
        }
      }
  >
}

export const move = async ({
  logger,
  streams,
  gameId,
  game,
  moveSan,
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
  const gameMove = chess.move(moveSan)
  const isAiGame = !!game.players.black.ai && !!game.players.white.ai
  const shouldEndEarly = chess.isDrawByFiftyMoves() && turns >= 65 && isAiGame
  const isTechnicalDraw = chess.isDraw() && !shouldEndEarly
  const status = shouldEndEarly || isTechnicalDraw ? 'draw' : chess.isGameOver() ? 'completed' : 'pending'
  const nextIllegalMoveAttempts = (game.players[player].illegalMoveAttempts ?? 0) + illegalMoveAttempts
  let endGameReason: string | undefined
  if (chess.isCheckmate()) {
    endGameReason = 'Checkmate'
  } else if (shouldEndEarly) {
    endGameReason = 'Ended Early'
  } else if (isTechnicalDraw) {
    endGameReason = 'Draw'
  }

  const pieceCaptured = gameMove?.captured
    ? {
        piece: gameMove.captured,
        score: getCaptureScore(gameMove.captured),
      }
    : undefined
  const isPawnPromotion = gameMove?.promotion !== undefined

  const newGame = await streams.chessGame.set('game', gameId, {
    id: gameId,
    fen: gameMove.after,
    status,
    turns: turns + 1,
    winner: status === 'completed' ? (chess.isCheckmate() ? player : undefined) : undefined,
    turn: player === 'white' ? 'black' : 'white',
    lastMove: [gameMove.from, gameMove.to],
    lastMoveSan: gameMove.san,
    endGameReason,
    players: {
      ...game.players,
      [player]: {
        ...game.players[player],
        illegalMoveAttempts: nextIllegalMoveAttempts,
        totalMoves: (game.players[player]?.totalMoves ?? 0) + 1,
        captures: pieceCaptured
          ? [...(game.players[player].captures ?? []), pieceCaptured]
          : game.players[player].captures,
        promotions: isPawnPromotion ? (game.players[player].promotions ?? 0) + 1 : game.players[player].promotions,
      },
    },
    check: chess.inCheck(),
  })

  const moveId = randomUUID()

  await streams.chessGameMove.set(gameId, moveId, {
    color: player,
    fenBefore: game.fen,
    fenAfter: gameMove.after,
    lastMove: [gameMove.from, gameMove.to],
    check: chess.inCheck(),
  })

  await emit({
    topic: 'evaluate-player-move',
    data: {
      gameId,
      fenBefore: game.fen,
      fenAfter: gameMove.after,
      moveId,
      player,
    },
  })

  if (status === 'pending') {
    await emit({
      topic: 'chess-game-moved',
      data: {
        gameId,
        player,
        fenBefore: game.fen,
        move: {
          from: gameMove.from,
          to: gameMove.to,
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
