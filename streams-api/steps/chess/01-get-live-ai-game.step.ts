import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { gameSchema } from './streams/00-chess-game.stream'
import { createGame } from '../../services/chess/create-game'

const aiEnum = z.enum(['openai', 'gemini', 'claude'])
const bodySchema = z.object({ players: z.array(aiEnum).length(2) })

type AiEnum = z.infer<typeof aiEnum>

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetLiveAiGame',
  description: 'Get a live AI game',
  path: '/chess/get-live-ai-game',
  method: 'POST',
  emits: [{ topic: 'chess-game-created', label: 'When a new game is created' }],
  flows: ['chess'],
  bodySchema,
  responseSchema: {
    200: gameSchema,
    400: z.object({ message: z.string(), errors: z.array(z.object({ message: z.string() })).optional() }),
  },
}

const aiNames: Record<AiEnum, string> = {
  openai: 'OpenAI',
  gemini: 'Gemini',
  claude: 'Claude',
}

export const handler: Handlers['GetLiveAiGame'] = async (req, { logger, emit, state, streams }) => {
  logger.info('[CreateGame] Received createGame event')

  const validationResult = bodySchema.safeParse(req.body)

  if (!validationResult.success) {
    logger.error('[CreateGame] Invalid request body', { errors: validationResult.error.errors })
    return { status: 400, body: { message: 'Invalid request body', errors: validationResult.error.errors } }
  }

  const white = req.body.players[0] as AiEnum
  const black = req.body.players[1] as AiEnum

  if (white === black) {
    logger.error('[GetLiveAiGame] AI agents cannot play against themselves')
    return { status: 400, body: { message: 'AI agents cannot play against themselves' } }
  }

  const id = `${white}-vs-${black}`
  const liveAiGame = await streams.chessLiveAiGames.get('game', id)
  const game = liveAiGame ? await streams.chessGame.get('game', liveAiGame.gameId) : null

  if (game && game.status === 'pending') {
    logger.info('[GetLiveAiGame] Returning existing game', { gameId: game.id })
    return { status: 200, body: game }
  }

  logger.info('[GetLiveAiGame] Creating new game', { white, black })

  const players = { white: { name: aiNames[white], ai: white }, black: { name: aiNames[black], ai: black } }
  const newGame = await createGame(players, streams, logger)

  await streams.chessLiveAiGames.set('game', id, {
    id,
    gameId: newGame.id,
    players: { white, black },
  })

  await emit({
    topic: 'chess-game-created',
    data: { gameId: newGame.id, fenBefore: newGame.fen },
  })

  return { status: 200, body: newGame }
}
