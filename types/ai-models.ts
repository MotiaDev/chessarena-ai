import * as z from 'zod'

export const AiModelProviderSchema = z.enum(['openai', 'gemini', 'claude', 'grok'])
export const AiModelsSchema = z.object(
  Object.fromEntries(AiModelProviderSchema.options.map((provider) => [provider, z.array(z.string())])) as {
    [key in AiModelProvider]: z.ZodArray<z.ZodString>
  },
)
export const AiProviderDefaultModelSchema = z.object(
  Object.fromEntries(AiModelProviderSchema.options.map((provider) => [provider, z.string()])) as {
    [key in AiModelProvider]: z.ZodString
  },
)

export const AiPlayerPromptSchema = z
  .object({
    thought: z
      .string()
      .describe(
        'The thought process of the move. Make it look like you were just thinking for yourself, this is not an explanation to someone else. Keep it short and concise.',
      ),
    moveSan: z.string().describe('The move in Standard Algebraic Notation (SAN)'),
  })
  .describe("The AI player response to the prompt. Don't include any other text than the thought and moveSan.")

export type AiModels = z.infer<typeof AiModelsSchema>
export type AiProviderDefaultModel = z.infer<typeof AiProviderDefaultModelSchema>
export type AiModelProvider = z.infer<typeof AiModelProviderSchema>
export type AiPlayerPrompt = z.infer<typeof AiPlayerPromptSchema>
