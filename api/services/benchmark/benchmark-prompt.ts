import { z } from 'zod'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { getBenchmarkProviderOptions } from '../ai/provider-options'
import { getBenchmarkConfig } from './benchmark-config'
import { withRetries, withRetriesNoTimeout } from './retry'

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

const shouldDisableTimeout = (provider: AiModelProvider, model: string): boolean => {
  if (provider !== 'grok') return false
  const enabled = (process.env.BENCHMARK_GROK_DISABLE_TIMEOUT ?? 'true') === 'true'
  if (!enabled) return false
  return model.startsWith('grok-3') || model.startsWith('grok-4')
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

  const cfg = getBenchmarkConfig()
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
    const disableTimeout = shouldDisableTimeout(provider, model)
    const providerOptionsBase = getBenchmarkProviderOptions(provider, model)
    const providerOptions =
      provider === 'gemini'
        ? {
            ...providerOptionsBase,
            google: { ...(providerOptionsBase as any)?.google, responseMimeType: 'application/json' },
          }
        : providerOptionsBase

    const runGenerateText = async (opts: { providerOptions: Record<string, any> }) => {
      if (disableTimeout) {
        return await withRetriesNoTimeout(label, cfg.transientRetries, cfg.retryBaseBackoffMs, async () => {
          return await generateText({
            model: providerModel,
            prompt,
            maxRetries: 0,
            maxOutputTokens: cfg.maxOutputTokens,
            providerOptions: opts.providerOptions,
          })
        })
      }

      const deadlineMs = startTime + cfg.perItemTimeoutMs
      return await withRetries(label, deadlineMs, cfg.transientRetries, cfg.retryBaseBackoffMs, async (abortSignal) => {
        return await generateText({
          model: providerModel,
          prompt,
          maxRetries: 0,
          abortSignal,
          maxOutputTokens: cfg.maxOutputTokens,
          providerOptions: opts.providerOptions,
        })
      })
    }

    let text: string
    try {
      ;({ text } = await runGenerateText({ providerOptions }))
    } catch (e) {
      if (provider === 'grok') {
        ;({ text } = await runGenerateText({ providerOptions: {} }))
      } else {
        throw e
      }
    }

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
  } catch (error) {
    const elapsed = Date.now() - startTime
    const anyErr = error as any
    const statusCode = typeof anyErr?.statusCode === 'number' ? anyErr.statusCode : undefined
    const errorMsgBase = error instanceof Error ? error.message : 'Unknown error'
    const errorMsg =
      statusCode != null
        ? `${errorMsgBase} (status ${statusCode})`
        : errorMsgBase
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
