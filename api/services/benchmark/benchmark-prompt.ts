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
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY })
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

  logger.info('Making benchmark prompt', { provider, model })

  try {
    const providerModel = createProviderModel(provider, model)

    const { object } = await generateObject({
      model: providerModel,
      prompt,
      schema: LegalMovesResponseSchema,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(120000), // 2 minute timeout
    })

    logger.info('Benchmark prompt completed', {
      provider,
      model,
      movesCount: object.moves?.length ?? 0,
    })

    return {
      moves: object.moves ?? [],
      rawResponse: JSON.stringify(object),
    }
  } catch (error) {
    logger.error('Benchmark prompt failed', {
      provider,
      model,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Return empty result on error
    return {
      moves: [],
      rawResponse: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
