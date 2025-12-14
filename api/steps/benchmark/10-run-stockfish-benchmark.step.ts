import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { AiModelProviderSchema } from '@chessarena/types/ai-models'
import { StockfishBenchmarkRunSchema } from '@chessarena/types/stockfish-benchmark'
import { playGameAgainstStockfish } from '../../services/benchmark/stockfish-game'
import { supportedModelsByProvider } from '../../services/ai/models'

const bodySchema = z.object({
  provider: AiModelProviderSchema(),
  model: z.string(),
  stockfishLevel: z.number().min(1).max(20).default(10),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RunStockfishBenchmark',
  description: 'Run Stockfish benchmark (2 games: one as white, one as black)',
  path: '/benchmark/stockfish/run',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: StockfishBenchmarkRunSchema,
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['RunStockfishBenchmark'] = async (req, { logger, streams }) => {
  const { provider, model, stockfishLevel } = req.body

  // Validate model
  const supportedModels = supportedModelsByProvider[provider]
  if (!supportedModels?.includes(model)) {
    return {
      status: 400,
      body: { message: `Model ${model} is not supported for provider ${provider}` },
    }
  }

  const runId = crypto.randomUUID()
  logger.info('=== STARTING STOCKFISH BENCHMARK ===', { provider, model, stockfishLevel })

  const run = {
    id: runId,
    createdAt: Date.now(),
    status: 'running' as const,
    provider,
    model,
    stockfishLevel,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  }

  // Run games in background
  const runBenchmark = async () => {
    try {
      // Game 1: AI plays as White
      logger.info('\n=== GAME 1: AI as WHITE ===')
      const gameAsWhite = await playGameAgainstStockfish(provider, model, 'white', stockfishLevel, logger)
      run.gameAsWhite = gameAsWhite
      run.gamesPlayed++
      if (gameAsWhite.result === 'ai_win') run.wins++
      else if (gameAsWhite.result === 'stockfish_win') run.losses++
      else run.draws++

      logger.info(`Game 1 result: ${gameAsWhite.result}, ACPL: ${gameAsWhite.averageCentipawnLoss?.toFixed(1)}`)

      // Small delay between games
      await new Promise((r) => setTimeout(r, 2000))

      // Game 2: AI plays as Black
      logger.info('\n=== GAME 2: AI as BLACK ===')
      const gameAsBlack = await playGameAgainstStockfish(provider, model, 'black', stockfishLevel, logger)
      run.gameAsBlack = gameAsBlack
      run.gamesPlayed++
      if (gameAsBlack.result === 'ai_win') run.wins++
      else if (gameAsBlack.result === 'stockfish_win') run.losses++
      else run.draws++

      logger.info(`Game 2 result: ${gameAsBlack.result}, ACPL: ${gameAsBlack.averageCentipawnLoss?.toFixed(1)}`)

      // Calculate overall ACPL
      const totalMoves = (gameAsWhite.aiMoveCount ?? 0) + (gameAsBlack.aiMoveCount ?? 0)
      const totalLoss = (gameAsWhite.totalCentipawnLoss ?? 0) + (gameAsBlack.totalCentipawnLoss ?? 0)
      run.overallAcpl = totalMoves > 0 ? totalLoss / totalMoves : 0

      run.status = 'completed'
      run.completedAt = Date.now()

      // Store run
      await streams.stockfishBenchmark.set('runs', runId, run)

      // Update summary
      const summaryId = `${provider}:${model}`
      const existing = await streams.stockfishBenchmarkSummary.get('models', summaryId)
      await streams.stockfishBenchmarkSummary.set('models', summaryId, {
        id: summaryId,
        provider,
        model,
        runsCompleted: (existing?.runsCompleted ?? 0) + 1,
        averageAcpl: existing
          ? (existing.averageAcpl * existing.runsCompleted + run.overallAcpl) / (existing.runsCompleted + 1)
          : run.overallAcpl,
        bestAcpl: Math.min(existing?.bestAcpl ?? Infinity, run.overallAcpl),
        wins: (existing?.wins ?? 0) + run.wins,
        losses: (existing?.losses ?? 0) + run.losses,
        draws: (existing?.draws ?? 0) + run.draws,
        lastRunAt: Date.now(),
      })

      logger.info('\n========================================')
      logger.info('=== STOCKFISH BENCHMARK COMPLETED ===')
      logger.info(
        `${provider}/${model}: Overall ACPL=${run.overallAcpl?.toFixed(1)}, W/L/D: ${run.wins}/${run.losses}/${run.draws}`,
      )
      logger.info('========================================\n')
    } catch (error) {
      run.status = 'failed'
      logger.error('Stockfish benchmark failed', { error })
    }
  }

  // Fire and forget
  runBenchmark()

  return {
    status: 200,
    body: run,
  }
}
