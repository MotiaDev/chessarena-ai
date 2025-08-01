import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RetryLastMove',
  description: 'Retry last move',
  path: '/chess/game/:id/retry-last-move',
  method: 'POST',
  emits: ['chess-game-moved', 'chess-game-ended'],
  flows: ['chess'],
  bodySchema: z.object({}),
  responseSchema: {
    200: z.object({
      message: z.string(),
    }),
    404: z.object({ message: z.string() }),
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['RetryLastMove'] = async (req, { logger, emit, streams, state }) => {
  logger.info('Received retry last move request', { body: req.body })
  
  const gameId = req.pathParams.id
  const game = await streams.chessGame.get('game', gameId)

  if (!game) {
    return { status: 404, body: { message: 'Game not found' } }
  } else if (game.status === 'completed') {
    return { status: 400, body: { message: 'Game is finished' } }
  } else if (!game.players[game.turn].ai) {
    return { status: 400, body: { message: 'Cannot retry last unless AI is playing' } }
  }

  const messageId = crypto.randomUUID()

  const player = game.turn === 'white' ? game.players.white : game.players.black
  if (!!player.ai) {
    await streams.chessGameMessage.set(gameId, messageId, {
      message: 'Retrying move...',
      sender: player.ai,
      role: game.turn,
      timestamp: Date.now(),
    })
  }

  await streams.chessGame.set('game', game.id, {
    ...game,
    status: 'pending',
  })

  await emit({
    topic: 'chess-game-moved',
    data: {
      gameId,
      fenBefore: game.fen,
    },
  })

  return { status: 200, body: { message: 'Last move retried' } }
}