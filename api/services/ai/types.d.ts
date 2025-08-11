import { Logger } from 'motia'

type Stream = JSONStream<z.infer<typeof zod>>

type HandlerInput<T extends ZodRawShape> = {
  prompt: string
  zod: ZodObject<T>
  logger: Logger
  model?: string
}

export type Handler = <T extends ZodRawShape>(input: HandlerInput<T>) => Promise<T>
