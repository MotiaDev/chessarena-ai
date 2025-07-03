import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'TrackAiMoveScore',
  description: 'track the result from an ai step evaluation result',
  subscribes: ["ai-move-scored"],
  emits: [],
  input: z.object({
    evaluation: z.number(),
    isMate: z.boolean(),
    bestMove: z.string(),
    gameId: z.string(),
    moveId: z.string(),
  }),
  flows: ["chess"]
}

export const handler: Handlers['TrackAiMoveScore'] = async (input, { logger, emit }) => {
  logger.info('[TrackAiMoveScore] received message', input)

  // Add your handler logic here
  
  // Example emit
  // await emit({
  //   topic: 'event-type',
  //   data: {}
  // })
}