import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { PositionSetSchema } from '@chessarena/types/legal-move-benchmark'
import { generateTestPositions } from '../../services/benchmark/run-legal-move-benchmark'

const bodySchema = z.object({
  count: z.number().min(1).max(50).default(20),
  force: z.boolean().default(false), // Force regenerate even if exists
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GeneratePositionSet',
  description: 'Generate and store a set of test positions for benchmarking',
  path: '/benchmark/positions/generate',
  method: 'POST',
  emits: [],
  flows: ['benchmark'],
  bodySchema,
  responseSchema: {
    200: PositionSetSchema,
    400: z.object({ message: z.string() }),
  },
}

export const handler: Handlers['GeneratePositionSet'] = async (req, { logger, streams }) => {
  const { count, force } = req.body

  logger.info('Generating position set', { count, force })

  // Check if we already have a position set
  const existingSet = await streams.positionSet.get('sets', 'default')
  if (existingSet && existingSet.positions.length >= count && !force) {
    logger.info('Using existing position set', { existingCount: existingSet.positions.length })
    return { status: 200, body: existingSet }
  }

  try {
    const positions = generateTestPositions({ count })

    if (positions.length === 0) {
      return { status: 400, body: { message: 'Failed to generate any positions' } }
    }

    const positionSet = {
      id: `positions-${Date.now()}`,
      createdAt: Date.now(),
      count: positions.length,
      positions,
    }

    // Store the position set
    await streams.positionSet.set('sets', 'default', positionSet)

    logger.info('Position set created', { count: positions.length })

    return { status: 200, body: positionSet }
  } catch (error) {
    logger.error('Failed to generate positions', { error })
    return {
      status: 400,
      body: { message: error instanceof Error ? error.message : 'Failed to generate positions' },
    }
  }
}
