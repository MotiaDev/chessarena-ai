import { z } from 'zod'

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

export type AiModels = z.infer<ReturnType<typeof AiModelsSchema>>
export type AiProviderDefaultModel = z.infer<typeof AiProviderDefaultModelSchema>
export type AiModelProvider = z.infer<ReturnType<typeof AiModelProviderSchema>>
