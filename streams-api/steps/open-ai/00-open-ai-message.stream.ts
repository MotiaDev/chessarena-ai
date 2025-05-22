import { StateStreamConfig } from 'motia'
import { z } from 'zod'

export const config: StateStreamConfig = {
  name: 'message',
  schema: z.object({
    message: z.string(),
    status: z.enum(['created', 'pending', 'completed']),
  }),
  baseConfig: { storageType: 'state', property: 'message' },
}
