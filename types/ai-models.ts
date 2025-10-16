import { z } from 'zod/v3'

export const AiModelProviderSchema = () => z.enum(['openai', 'gemini', 'claude', 'grok'])
export const AiModelsSchema = () =>
  z.object(
    Object.fromEntries(AiModelProviderSchema().options.map((provider) => [provider, z.array(z.string())])) as {
      [key in AiModelProvider]: z.ZodArray<z.ZodString>
    },
  )
export const AiProviderDefaultModelSchema = z.object(
  Object.fromEntries(AiModelProviderSchema().options.map((provider) => [provider, z.string()])) as {
    [key in AiModelProvider]: z.ZodString
  },
)

export const AiPlayerPromptSchema = z.object({
  thought: z
    .string()
    .describe(
      'A short and concise thought process of the move. Make it look like you were just thinking for yourself, this is not an explanation to someone else. Max 100 characters.',
    ),
  move: z
    .object({
      from: z.string().describe('The square to move from, example: e2, Make sure to move from a valid square'),
      to: z.string().describe('The square to move to, example: e4. Make sure to move to a valid square'),
      promote: z
        .enum(['queen', 'rook', 'bishop', 'knight'])
        .optional()
        .describe("The promotion piece, if any. Don't include if no promotion"),
    })
    .describe('Your move, make sure to move from a valid square and to a valid square'),
})

export type AiModels = z.infer<ReturnType<typeof AiModelsSchema>>
export type AiProviderDefaultModel = z.infer<typeof AiProviderDefaultModelSchema>
export type AiModelProvider = z.infer<ReturnType<typeof AiModelProviderSchema>>
export type AiPlayerPrompt = z.infer<typeof AiPlayerPromptSchema>
