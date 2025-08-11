import { EventConfig as MotiaEventConfig, Handlers } from 'motia'
import { z } from 'zod'

type StepConfig = MotiaEventConfig & {
  triggers: MotiaTrigger[]
}

type MotiaTrigger = any

type TopicTrigger = {
  condition: ObjectOperationCheck
}

type ObjectOperationCheck = boolean
type ObjectOperation = {
  eq: (value: any) => ObjectOperationCheck
  ne: (value: any) => ObjectOperationCheck
  gt: (value: any) => ObjectOperationCheck
  gte: (value: any) => ObjectOperationCheck
  lt: (value: any) => ObjectOperationCheck
  lte: (value: any) => ObjectOperationCheck
  in: (value: any) => ObjectOperationCheck
}

type ObjectCondition = {
  get: (path: string | ObjectCondition) => ObjectOperation & ObjectCondition
}

type Conditions = {
  state: ObjectCondition
  input: ObjectCondition
}

type Triggers = {
  topic: (topic: string, data: TopicTrigger) => MotiaTrigger
  stateUpdate: (check: ObjectOperationCheck) => MotiaTrigger
}

const triggers: Triggers = {
  topic: (topic: string, data: TopicTrigger): MotiaTrigger => {
    return {
      data,
    }
  },
  stateUpdate: (check: ObjectOperationCheck): MotiaTrigger => {
    return {
      state: check,
    }
  },
}

const state: ObjectCondition = null as never
const input: ObjectCondition = null as never

export const config: StepConfig = {
  name: 'OpenAI Model',
  description: 'Executes on a player move when AI Model is OpenAI',
  triggers: [
    triggers.topic('player-move', {
      condition: input.get('ai.model').eq('open-ai'),
    }),
    triggers.stateUpdate(state.get('ai.model').eq('open-ai')),
  ],

  flows: ['chess'],
  input: z.object({
    gameId: z.string({ description: 'The ID of the game' }),
    fenBefore: z.string({ description: 'The FEN of the game before the move' }),
    ai: z.object({
      model: z.string({ description: 'The model of the AI' }),
    }),
  }),

  emits: ['test'],
  type: 'event',
  subscribes: ['test'],
}
