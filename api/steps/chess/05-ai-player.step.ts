import { AiPlayerPrompt } from '@chessarena/types/ai-models'
import { Chess } from 'chess.js'
import mustache from 'mustache'
import { queue, type Handlers, type StepConfig } from 'motia'
import { z } from 'zod'
import { makePrompt } from '../../services/ai/make-prompt'
import { move } from '../../services/chess/move'
import { template } from './05-ai-player.template'

const MAX_ATTEMPTS = 3

const inputSchema = z.object({
  player: z.enum(['white', 'black']).describe('The player that made the move'),
  fenBefore: z.string().describe('The FEN of the game before the move'),
  fen: z.string().describe('The FEN of the game'),
  lastMove: z.array(z.string()).describe('The last move made, example ["c3", "c4"]').optional(),
  check: z.boolean().describe('Whether the move is a check'),
  gameId: z.string().describe('The ID of the game'),
})

export const config = {
  name: 'AI_Player',
  description: 'AI Player',
  flows: ['chess'],
  triggers: [queue('ai-move', { input: inputSchema })],
  enqueues: ['chess-game-moved', 'chess-game-ended', 'evaluate-player-move'],
  virtualEnqueues: [],
  includeFiles: ['05-ai-player.mustache'],
} as const satisfies StepConfig

export const handler: Handlers<typeof config> = async (input, { logger, enqueue, streams }) => {
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
  const chess = new Chess(game.fen)
  const validMoves = chess.moves({ verbose: true })

  while (true) {
    const messageId = crypto.randomUUID()

    logger.info('Creating message', { messageId, gameId: input.gameId })
    const { new_value: message } = await streams.chessGameMessage.set(input.gameId, messageId, {
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
        inCheck: input.check,
        player: input.player,
        lastInvalidMove,
        validMoves,
        totalMoves: validMoves.length,
      },
      {},
      { escape: (value: string) => value },
    )
    logger.info('Prompt', { prompt })

    let action: AiPlayerPrompt | undefined

    try {
      action = await makePrompt({
        prompt,
        provider: player.ai,
        logger,
        model: player.model!,
        onThoughtUpdate: async (partialThought) => {
          if (partialThought) {
            await streams.chessGameMessage.set(input.gameId, messageId, {
              id: messageId,
              message: partialThought,
              sender: player.ai!,
              role: input.player,
              timestamp: Date.now(),
            })
          }
        },
      })

      logger.info('Updating message', { messageId, gameId: input.gameId })

      if (action) {
        await streams.chessGameMessage.set(input.gameId, messageId, {
          ...message,
          message: action.thought,
          moveSan: action.moveSan,
        })

        logger.info('AI response', { action })

        await move({
          logger,
          streams,
          gameId: input.gameId,
          player: input.player,
          game,
          moveSan: action.moveSan,
          enqueue,
          illegalMoveAttempts: attempts,
        })

        logger.info('Move successful', { move: action.moveSan })
      }

      return
    } catch (error) {
      logger.error('Error making prompt', { error })

      if (action) {
        await streams.chessGameMessage.set(input.gameId, messageId, {
          ...message,
          message: action.thought,
          isIllegalMove: true,
          moveSan: action.moveSan,
        })

        logger.error('Invalid move', { move: action.moveSan })
        lastInvalidMove = action.moveSan
      } else {
        await streams.chessGameMessage.set(input.gameId, messageId, {
          ...message,
          message: 'Error making prompt, I will need to try again soon',
        })
      }

      /**
       * Player loses the game if they make too many illegal moves
       */
      if (++attempts >= MAX_ATTEMPTS) {
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

        await enqueue({
          topic: 'chess-game-ended',
          data: { gameId: input.gameId },
        })

        return
      }
    }
  }
}
