import { z } from 'zod'
import { generateText } from 'ai'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { getBenchmarkProviderOptions } from '../ai/provider-options'
import { getBenchmarkConfig } from './benchmark-config'
import { withRetries, withRetriesNoTimeout } from './retry'
import { createProviderModel, shouldDisableTimeout, getApiKeyEnvVar } from './shared-utils'

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

type ProviderOptions = Record<string, unknown>

export const makeBenchmarkPrompt = async (input: BenchmarkPromptInput): Promise<BenchmarkPromptResult> => {
  const { prompt, provider, model, logger } = input

  const cfg = getBenchmarkConfig()
  const startTime = Date.now()
  const label = `${provider}/${model}`

  // Check API key
  const apiKeyEnvVar = getApiKeyEnvVar(provider)
  const apiKey = process.env[apiKeyEnvVar]
  if (!apiKey) {
    logger.error(`[${label}] Missing ${apiKeyEnvVar}`)
    return { moves: [], rawResponse: `Missing ${apiKeyEnvVar}`, error: `Missing ${apiKeyEnvVar}` }
  }

  try {
    const providerModel = createProviderModel(provider, model)
    const disableTimeout = shouldDisableTimeout(provider, model)
    const providerOptionsBase = getBenchmarkProviderOptions(provider, model)

    // Add JSON response format for Gemini
    const providerOptions: ProviderOptions =
      provider === 'gemini'
        ? {
            ...providerOptionsBase,
            google: {
              ...(providerOptionsBase?.google as Record<string, unknown> | undefined),
              responseMimeType: 'application/json',
            },
          }
        : providerOptionsBase

    const runGenerateText = async (opts: { providerOptions: ProviderOptions }) => {
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
      // Retry Grok with empty provider options if initial request fails
      // This is a workaround for Grok API compatibility issues
      if (provider === 'grok') {
        logger.warn(`[${label}] Initial request failed, retrying with empty provider options`)
        ;({ text } = await runGenerateText({ providerOptions: {} }))
      } else {
        throw e
      }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      // Try to extract JSON from the response
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        try {
          parsed = JSON.parse(text.slice(start, end + 1))
        } catch {
          logger.warn(`[${label}] Could not parse extracted JSON from response`)
          return { moves: [], rawResponse: text, error: 'Could not parse JSON response' }
        }
      } else {
        logger.warn(`[${label}] No JSON found in response`)
        return { moves: [], rawResponse: text, error: 'Could not parse JSON response' }
      }
    }

    const validated = LegalMovesResponseSchema.safeParse(parsed)
    if (!validated.success) {
      logger.warn(`[${label}] Response did not match schema: ${validated.error.message}`)
      return { moves: [], rawResponse: text, error: 'Response did not match schema' }
    }

    return { moves: validated.data.moves, rawResponse: text }
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorWithStatus = error as { statusCode?: number }
    const statusCode = typeof errorWithStatus?.statusCode === 'number' ? errorWithStatus.statusCode : undefined
    const errorMsgBase = error instanceof Error ? error.message : 'Unknown error'
    const errorMsg = statusCode != null ? `${errorMsgBase} (status ${statusCode})` : errorMsgBase
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
