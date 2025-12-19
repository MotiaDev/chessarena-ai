import { z } from 'zod'
import { streamObject } from 'ai'
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

const TIMEOUT_MS = 180000 // 3 minutes

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
    return { moves: [], rawResponse: `Missing ${apiKeyEnvVar}` }
  }

  try {
    const providerModel = createProviderModel(provider, model)

    const { partialObjectStream, object } = streamObject({
      model: providerModel,
      prompt,
      schema: LegalMovesResponseSchema,
      mode: provider === 'grok' ? 'json' : undefined,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      providerOptions: getMaxReasoningProviderOptions(provider, model),
      experimental_structuredOutputWithThinking: provider === 'claude',
    })

    // Consume stream silently (no per-chunk logging to avoid memory issues)
    for await (const _partial of partialObjectStream) {
      // Just consume, no logging
    }

    const result = await object

    if (!result.moves) {
      logger.error(`[${label}] Invalid response - no moves`)
      return { moves: [], rawResponse: 'No moves returned' }
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
    }
  }
}
