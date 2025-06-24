import { Logger } from 'motia'

export type Models = 'openai' | 'gemini' | 'claude'
export type Handler = <T extends ZodRawShape>(
  input: string,
  zod: ZodObject<T>,
  logger: Logger,
) => Promise<z.infer<typeof zod>>
