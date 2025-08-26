import fs from 'fs'
import { EventConfig, Handlers } from 'motia'
import mustache from 'mustache'
import path from 'path'
import { z } from 'zod'
import { makePrompt } from '../../services/ai/make-prompt'
import { evaluateBestMoves } from '../../services/chess/evaluate-best-moves'
import { move } from '../../services/chess/move'

const MAX_ATTEMPTS = 3

export const config: EventConfig = {
  type: 'event',
  name: 'AI_Player',
  description: 'AI Player',
  subscribes: ['ai-move'],
  emits: ['chess-game-moved', 'chess-game-ended', 'evaluate-player-move'],
  flows: ['chess'],
  input: z.object({
    player: z.enum(['white', 'black'], { description: 'The player that made the move' }),
    fenBefore: z.string({ description: 'The FEN of the game before the move' }),
    fen: z.string({ description: 'The FEN of the game' }),
    lastMove: z.array(z.string(), { description: 'The last move made, example ["c3", "c4"]' }).optional(),
    check: z.boolean({ description: 'Whether the move is a check' }),
    gameId: z.string({ description: 'The ID of the game' }),
  }),
  includeFiles: ['05-ai-player.mustache'],
}

const responseSchema = z.object({
  thought: z.string({
    description:
      'The thought process of the move, make it look like you were just thinking for yourself, this is not an explanation to someone else',
  }),
  move: z.object(
    {
      from: z.string({ description: 'The square to move from, example: e2, Make sure to move from a valid square' }),
      to: z.string({ description: 'The square to move to, example: e4. Make sure to move to a valid square' }),
      promote: z.enum(['queen', 'rook', 'bishop', 'knight'], { description: 'The promotion piece, if any' }).optional(),
    },
    { description: 'Your move, make sure to move from a valid square and to a valid square' },
  ),
})

const template = fs.readFileSync(path.join(__dirname, '05-ai-player.mustache'), 'utf8')

export const handler: Handlers['AI_Player'] = async (input, { logger, emit, streams }) => {
  logger.info('Received ai-move event', { gameId: input.gameId })

  const game = await streams.chessGame.get('game', input.gameId)
  if (!game) {
    logger.error('Game not found', { gameId: input.gameId })
    return
  }

  const player = input.player === 'white' ? game.players.white : game.players.black

  if (!player.ai) {
    logger.error('Player has no AI configured', { gameId: input.gameId })
    return
  }

  let attempts = 0
  let lastInvalidMove = undefined

  const validMoves = evaluateBestMoves(game)

  while (true) {
    const messageId = crypto.randomUUID()

    logger.info('Creating message', { messageId, gameId: input.gameId })
    const message = await streams.chessGameMessage.set(input.gameId, messageId, {
      id: messageId,
      message: 'Thinking...',
      sender: player.ai,
      role: input.player,
      timestamp: Date.now(),
    })

    const prompt = mustache.render(
      template,
      {
        fenBefore: input.fenBefore,
        fen: input.fen,
        lastMove: input.lastMove ? { from: input.lastMove[0], to: input.lastMove[1] } : undefined,
        inCheck: input.check,
        player: input.player,
        lastInvalidMove,
        validMoves,
      },
      {},
      { escape: (value: string) => value },
    )

    let action: z.infer<typeof responseSchema> | undefined

    try {
      action = await makePrompt({
        prompt,
        zod: responseSchema,
        provider: player.ai,
        logger,
        model: player.model!,
      })

      logger.info('Updating message', { messageId, gameId: input.gameId })

      if (action) {
        await streams.chessGameMessage.set(input.gameId, messageId, {
          ...message,
          message: action.thought,
          move: action.move,
        })

        logger.info('AI response', { action })

        await move({
          logger,
          streams,
          gameId: input.gameId,
          player: input.player,
          game,
          action: action.move,
          emit,
          illegalMoveAttempts: attempts,
        })

        logger.info('Move successful', { action })
      }

      return
    } catch (err) {
      logger.error('Error making prompt', { err })

      if (action) {
        await streams.chessGameMessage.set(input.gameId, messageId, {
          ...message,
          message: action.thought,
          isIllegalMove: true,
          move: action.move,
        })

        logger.error('Invalid move', { move: action.move })
        lastInvalidMove = action.move
      } else {
        await streams.chessGameMessage.set(input.gameId, messageId, {
          ...message,
          message: 'Error making prompt, I will need to try again soon',
        })
      }

      /**
       * Player loses the game if they make too many illegal moves
       */
      if (attempts++ >= MAX_ATTEMPTS) {
        logger.error('Max attempts reached', { gameId: input.gameId, attempts, player: player.ai })

        const playerIllegalMoveAttempts = game.players[input.player].illegalMoveAttempts ?? 0

        await streams.chessGame.set('game', game.id, {
          ...game,
          status: 'completed',
          winner: input.player === 'white' ? 'black' : 'white',
          endGameReason: 'Too many illegal moves',
          players: {
            ...game.players,
            [input.player]: {
              ...game.players[input.player],
              illegalMoveAttempts: playerIllegalMoveAttempts + attempts,
            },
          },
        })

        await emit({
          topic: 'chess-game-ended',
          data: { gameId: input.gameId },
        })

        return
      }
    }
  }
}
