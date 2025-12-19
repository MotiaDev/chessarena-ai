import { z } from 'zod'
import { generateText, streamObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { getMaxReasoningProviderOptions } from '../ai/provider-options'

const LegalMovesResponseSchema = z.object({
  moves: z.array(z.string()).describe('Array of legal moves in Standard Algebraic Notation'),
})

type BenchmarkPromptInput = {
  prompt: string
  provider: AiModelProvider
  model: string
  logger: Logger
}

type BenchmarkPromptResult = {
  moves: string[]
  rawResponse: string
  error?: string
}

const createProviderModel = (provider: AiModelProvider, model: string) => {
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
      return openai(model)
    }
    case 'gemini': {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
      return google(model)
    }
    case 'claude': {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      return anthropic(model)
    }
    case 'grok': {
      const xai = createXai({ apiKey: process.env.XAI_API_KEY })
      return xai(model)
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

const TIMEOUT_MS = Number.parseInt(process.env.BENCHMARK_REQUEST_TIMEOUT_MS ?? '180000', 10) || 180000

export const makeBenchmarkPrompt = async (input: BenchmarkPromptInput): Promise<BenchmarkPromptResult> => {
  const { prompt, provider, model, logger } = input

  const startTime = Date.now()
  const label = `${provider}/${model}`

  // Check API key
  const apiKeyEnvVar = {
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    claude: 'ANTHROPIC_API_KEY',
    grok: 'XAI_API_KEY',
  }[provider]

  const apiKey = process.env[apiKeyEnvVar]
  if (!apiKey) {
    logger.error(`[${label}] Missing ${apiKeyEnvVar}`)
    return { moves: [], rawResponse: `Missing ${apiKeyEnvVar}`, error: `Missing ${apiKeyEnvVar}` }
  }

  try {
    const providerModel = createProviderModel(provider, model)
    const providerOptions = getMaxReasoningProviderOptions(provider, model)

    if (provider === 'claude' || provider === 'grok') {
      const { text } = await generateText({
        model: providerModel,
        prompt,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
        providerOptions,
      })

      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        const start = text.indexOf('{')
        const end = text.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
          try {
            parsed = JSON.parse(text.slice(start, end + 1))
          } catch {
            return { moves: [], rawResponse: text, error: 'Could not parse JSON response' }
          }
        } else {
          return { moves: [], rawResponse: text, error: 'Could not parse JSON response' }
        }
      }

      const validated = LegalMovesResponseSchema.safeParse(parsed)
      if (!validated.success) {
        return { moves: [], rawResponse: text, error: 'Response did not match schema' }
      }

      return { moves: validated.data.moves, rawResponse: text }
    }

    const { partialObjectStream, object } = streamObject({
      model: providerModel,
      prompt,
      schema: LegalMovesResponseSchema,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      providerOptions: providerOptions as any,
    })

    // Consume stream silently (no per-chunk logging to avoid memory issues)
    for await (const _partial of partialObjectStream) {
      // Just consume, no logging
    }

    const result = await object

    if (!result.moves) {
      logger.error(`[${label}] Invalid response - no moves`)
      return { moves: [], rawResponse: 'No moves returned', error: 'No moves returned' }
    }

    return {
      moves: result.moves,
      rawResponse: JSON.stringify(result),
    }
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'Error'

    logger.error(`[${label}] FAILED after ${elapsed}ms`)
    logger.error(`[${label}] Error type: ${errorName}`)
    logger.error(`[${label}] Error message: ${errorMsg}`)

    return {
      moves: [],
      rawResponse: errorMsg,
      error: errorMsg,
    }
  }
}
