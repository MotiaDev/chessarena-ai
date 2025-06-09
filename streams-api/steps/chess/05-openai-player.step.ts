import { EventConfig, Handlers } from 'motia'
import OpenAI from 'openai'
import { z } from 'zod'
import path from 'path'
import fs from 'fs'
import mustache from 'mustache'
import zodToJsonSchema from 'zod-to-json-schema'
import { move } from '../../services/chess/move'
import { Game } from './streams/00-chess-game.stream'

export const config: EventConfig = {
  type: 'event',
  name: 'OpenAiPlayer',
  description: 'OpenAI Player',
  subscribes: ['openai-move'],
  emits: ['chess-game-moved'],
  flows: ['chess'],
  input: z.object({
    player: z.enum(['white', 'black'], { description: 'The player that made the move' }),
    fenBefore: z.string({ description: 'The FEN of the game before the move' }),
    fen: z.string({ description: 'The FEN of the game' }),
    lastMove: z.array(z.string(), { description: 'The last move made, example ["c3", "c4"]' }).optional(),
    check: z.boolean({ description: 'Whether the move is a check' }),
    gameId: z.string({ description: 'The ID of the game' }),
  }),
  includeFiles: ['05-openai-player.mustache'],
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
      promotion: z.enum(['q', 'r', 'b', 'n'], { description: 'The promotion piece, if any' }).optional(),
    },
    { description: 'Your move, make sure to move from a valid square and to a valid square' },
  ),
})

type Response = z.infer<typeof responseSchema>

const template = fs.readFileSync(path.join(__dirname, '05-openai-player.mustache'), 'utf8')

export const handler: Handlers['OpenAiPlayer'] = async (input, { logger, emit, streams }) => {
  logger.info('[OpenAiPlayer] Received OpenAiPlayer event', { gameId: input.gameId })

  const game = await streams.chessGame.get('game', input.gameId)

  if (!game) {
    logger.error('[OpenAiPlayer] Game not found', { gameId: input.gameId })
    return
  }

  let lastInvalidMove = undefined

  while (true) {
    const messageId = crypto.randomUUID()

    logger.info('[OpenAiPlayer] Creating message', { messageId, gameId: input.gameId })
    const message = await streams.chessGameMessage.set(input.gameId, messageId, {
      message: 'Thinking...',
      sender: 'OpenAI',
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
      },
      {},
      { escape: (value: string) => value },
    )

    logger.info('[OpenAiPlayer] Prompt', { prompt })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'chess_move', schema: zodToJsonSchema(responseSchema) },
      },
    })

    const action = JSON.parse(completion.choices[0].message.content ?? '{}') as Response

    logger.info('[OpenAiPlayer] Updating message', { messageId, gameId: input.gameId })
    await streams.chessGameMessage.set(input.gameId, messageId, {
      ...message,
      message: action.thought,
      move: action.move,
    })

    try {
      await move({
        streams,
        gameId: input.gameId,
        player: input.player,
        game,
        action: action.move,
        emit,
      })
      logger.info('[OpenAiPlayer] OpenAI response', { action })

      return
    } catch (err) {
      await streams.chessGameMessage.set(input.gameId, messageId, {
        ...message,
        message: action.thought,
        isIllegalMove: true,
        move: action.move,
      })

      logger.error('[OpenAiPlayer] Invalid move', { move: action.move })
      lastInvalidMove = action.move
    }
  }
}
