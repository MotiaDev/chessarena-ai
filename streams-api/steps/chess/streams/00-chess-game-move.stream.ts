import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'chessGameMove',
  schema: z.object({
    color: z.enum(['white', 'black'], { description: 'The color that made the move' }),
    fenBefore: z.string({ description: 'The FEN of the game before the move' }),
    fenAfter: z.string({ description: 'The FEN of the game after the move' }),
    lastMove: z.array(z.string(), { description: 'The last move made, example ["c3", "c4"]' }),
    check: z.boolean({ description: 'Whether the move is a check' }),
  }),
  baseConfig: { storageType: 'default' },
}
