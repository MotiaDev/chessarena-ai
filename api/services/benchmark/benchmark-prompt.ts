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

export const makeBenchmarkPrompt = async (input: BenchmarkPromptInput): Promise<BenchmarkPromptResult> => {
  const { prompt, provider, model, logger } = input

  const startTime = Date.now()
  logger.info(`[${provider}/${model}] Starting API call...`)

  // Check API key
  const apiKeyEnvVar = {
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    claude: 'ANTHROPIC_API_KEY',
    grok: 'XAI_API_KEY',
  }[provider]

  const apiKey = process.env[apiKeyEnvVar]
  if (!apiKey) {
    logger.error(`[${provider}/${model}] MISSING API KEY: ${apiKeyEnvVar} not set`)
    return { moves: [], rawResponse: `Missing ${apiKeyEnvVar}` }
  }

  try {
    const providerModel = createProviderModel(provider, model)

    const { object } = await generateObject({
      model: providerModel,
      prompt,
      schema: LegalMovesResponseSchema,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(60000), // 1 minute timeout
    })

    const elapsed = Date.now() - startTime
    logger.info(`[${provider}/${model}] SUCCESS in ${elapsed}ms - ${object.moves?.length ?? 0} moves returned`)

    return {
      moves: object.moves ?? [],
      rawResponse: JSON.stringify(object),
    }
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'Error'

    logger.error(`[${provider}/${model}] FAILED after ${elapsed}ms`)
    logger.error(`[${provider}/${model}] Error type: ${errorName}`)
    logger.error(`[${provider}/${model}] Error message: ${errorMsg}`)

    // Check for common issues
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
      logger.error(`[${provider}/${model}] Invalid API key for ${apiKeyEnvVar}`)
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      logger.error(`[${provider}/${model}] Model "${model}" not found - check model name`)
    } else if (errorMsg.includes('429') || errorMsg.includes('rate')) {
      logger.error(`[${provider}/${model}] Rate limited`)
    } else if (errorMsg.includes('timeout') || errorMsg.includes('abort')) {
      logger.error(`[${provider}/${model}] Request timed out after 60s`)
    }

    return {
      moves: [],
      rawResponse: errorMsg,
    }
  }
}
