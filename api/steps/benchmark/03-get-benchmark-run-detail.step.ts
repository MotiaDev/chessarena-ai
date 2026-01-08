import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { LegalMoveBenchmarkRunSchema } from '@chessarena/types/legal-move-benchmark'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetBenchmarkRunDetail',
  description: 'Get detailed benchmark run including all positions and results',
  path: '/benchmark/legal-moves/runs/:runId',
  method: 'GET',
  emits: [],
  flows: ['benchmark'],
  responseSchema: {
    200: LegalMoveBenchmarkRunSchema,
    404: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['GetBenchmarkRunDetail'] = async (req, { logger, streams }) => {
  const { runId } = req.pathParams

  logger.info('Fetching benchmark run detail', { runId })

  const run = await streams.legalMoveBenchmark.get('runs', runId)

  if (!run) {
    return { status: 404, body: { message: 'Benchmark run not found' } }
  }

  return { status: 200, body: run }
}
