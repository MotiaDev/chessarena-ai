import { StateStreamConfig } from 'motia'
import { z } from 'zod'

export const config: StateStreamConfig = {
  name: 'thread',
  schema: z.object({
    messages: z.array(
      z.object({
        id: z.string(),
        from: z.enum(['user', 'assistant']),
      }),
    ),
  }),
  baseConfig: { storageType: 'state', property: 'messages' },
}
