import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { AiModelProviderSchema } from '@chessarena/types/ai-models'
import { LegalMoveBenchmarkRunSchema } from '@chessarena/types/legal-move-benchmark'

const querySchema = z.object({
  provider: AiModelProviderSchema().optional(),
  model: z.string().optional(),
  limit: z.coerce.number().default(20),
  offset: z.coerce.number().default(0),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetBenchmarkRuns',
  description: 'Get legal move benchmark runs with optional filters',
  path: '/benchmark/legal-moves/runs',
  method: 'GET',
  emits: [],
  flows: ['benchmark'],
  querySchema,
  responseSchema: {
    200: z.object({
      runs: z.array(
        LegalMoveBenchmarkRunSchema.omit({ positions: true, results: true }).extend({
          resultsCount: z.number(),
        }),
      ),
      total: z.number(),
    }),
  },
}

export const handler: Handlers['GetBenchmarkRuns'] = async (req, { logger, streams }) => {
  const { provider, model, limit, offset } = req.queryParams as z.infer<typeof querySchema>

  logger.info('Fetching benchmark runs', { provider, model, limit, offset })

  const allRuns = await streams.legalMoveBenchmark.getGroup('runs')

  // Filter
  let filtered = allRuns.filter((run) => {
    if (provider && run.provider !== provider) return false
    if (model && run.model !== model) return false
    return true
  })

  // Sort by most recent
  filtered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  const total = filtered.length

  // Paginate
  const paginated = filtered.slice(offset, offset + limit)

  // Remove heavy fields and add count
  const runs = paginated.map(({ positions, results, ...rest }) => ({
    ...rest,
    resultsCount: results?.length ?? 0,
  }))

  return { status: 200, body: { runs, total } }
}
