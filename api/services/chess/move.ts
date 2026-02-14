import type { Game } from '@chessarena/types/game'
import { Chess } from 'chess.js'
import { randomUUID } from 'crypto'
import type { Enqueuer, Logger } from 'motia'
import { getCaptureScore } from './get-capture-score'

type MoveEnqueueData =
  | {
      topic: 'chess-game-moved'
      data: { gameId: string; player: string; move: { from: string; to: string }; fenBefore: string }
    }
  | { topic: 'chess-game-ended'; data: { gameId: string } }
  | {
      topic: 'evaluate-player-move'
      data: { gameId: string; fenBefore: string; fenAfter: string; moveId: string; player: string }
    }

type Args = {
  logger: Logger
  streams: import('motia').Streams
  gameId: string
  game: Game
  moveSan: string
  player: 'white' | 'black'
  illegalMoveAttempts?: number
  enqueue: Enqueuer<MoveEnqueueData>
}

export const move = async ({
  logger,
  streams,
  gameId,
  game,
  moveSan,
  enqueue,
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
  const shouldEndEarly = turns >= 64 && isAiGame
  const status = shouldEndEarly ? 'endedEarly' : chess.isDraw() ? 'draw' : chess.isGameOver() ? 'completed' : 'pending'
  const nextIllegalMoveAttempts = (game.players[player].illegalMoveAttempts ?? 0) + illegalMoveAttempts
  let endGameReason: string | undefined
  if (chess.isCheckmate()) {
    endGameReason = 'Checkmate'
  } else if (shouldEndEarly) {
    endGameReason = 'Ended Early'
  } else if (chess.isDraw()) {
    endGameReason = 'Draw'
  }

  const pieceCaptured = gameMove?.captured
    ? {
        piece: gameMove.captured,
        score: getCaptureScore(gameMove.captured),
      }
    : undefined
  const isPawnPromotion = gameMove?.promotion !== undefined

  const { new_value: newGame } = await streams.chessGame.set('game', gameId, {
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

  await enqueue({
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
    await enqueue({
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
    await enqueue({
      topic: 'chess-game-ended',
      data: { gameId },
    })
  }

  return newGame
}
