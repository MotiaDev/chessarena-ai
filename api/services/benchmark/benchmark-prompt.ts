import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createXai } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'

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

const TIMEOUT_MS = 60000 // 1 minute

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms: ${label}`)), ms)),
  ])
}

export const makeBenchmarkPrompt = async (input: BenchmarkPromptInput): Promise<BenchmarkPromptResult> => {
  const { prompt, provider, model, logger } = input

  const startTime = Date.now()
  const label = `${provider}/${model}`
  logger.info(`[${label}] Starting API call...`)

  // Check API key
  const apiKeyEnvVar = {
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    claude: 'ANTHROPIC_API_KEY',
    grok: 'XAI_API_KEY',
  }[provider]

  const apiKey = process.env[apiKeyEnvVar]
  if (!apiKey) {
    logger.error(`[${label}] MISSING API KEY: ${apiKeyEnvVar} not set`)
    return { moves: [], rawResponse: `Missing ${apiKeyEnvVar}` }
  }

  logger.info(`[${label}] API key present, creating provider model...`)

  try {
    const providerModel = createProviderModel(provider, model)
    logger.info(`[${label}] Provider model created, calling generateObject...`)

    const apiCall = generateObject({
      model: providerModel,
      prompt,
      schema: LegalMovesResponseSchema,
      maxRetries: 1,
    })

    const { object } = await withTimeout(apiCall, TIMEOUT_MS, label)

    const elapsed = Date.now() - startTime
    logger.info(`[${label}] SUCCESS in ${elapsed}ms - ${object.moves?.length ?? 0} moves returned`)

    return {
      moves: object.moves ?? [],
      rawResponse: JSON.stringify(object),
    }
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'Error'

    logger.error(`[${label}] FAILED after ${elapsed}ms`)
    logger.error(`[${label}] Error type: ${errorName}`)
    logger.error(`[${label}] Error message: ${errorMsg}`)

    // Check for common issues
    if (errorMsg.includes('TIMEOUT')) {
      logger.error(`[${label}] Request timed out after ${TIMEOUT_MS}ms`)
    } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
      logger.error(`[${label}] Invalid API key for ${apiKeyEnvVar}`)
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      logger.error(`[${label}] Model "${model}" not found - check model name`)
    } else if (errorMsg.includes('429') || errorMsg.includes('rate')) {
      logger.error(`[${label}] Rate limited`)
    }

    return {
      moves: [],
      rawResponse: errorMsg,
    }
  }
}
