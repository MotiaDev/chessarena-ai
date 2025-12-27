import { parsePositiveInt } from './concurrency'

export type BenchmarkConfig = {
  perItemTimeoutMs: number
  maxOutputTokens: number
  transientRetries: number
  retryBaseBackoffMs: number
  itemConcurrency: number
}

export const getBenchmarkConfig = (): BenchmarkConfig => {
  const perItemTimeoutMs = Number.parseInt(process.env.BENCHMARK_PER_ITEM_TIMEOUT_MS ?? '', 10) || 10_000
  const maxOutputTokens = Number.parseInt(process.env.BENCHMARK_MAX_OUTPUT_TOKENS ?? '', 10) || 192
  const transientRetries = Number.parseInt(process.env.BENCHMARK_TRANSIENT_RETRIES ?? '', 10) || 1
  const retryBaseBackoffMs = Number.parseInt(process.env.BENCHMARK_RETRY_BASE_BACKOFF_MS ?? '', 10) || 200
  const itemConcurrency = parsePositiveInt(process.env.BENCHMARK_ITEM_CONCURRENCY, 1)

  return {
    perItemTimeoutMs,
    maxOutputTokens,
    transientRetries,
    retryBaseBackoffMs,
    itemConcurrency,
  }
}



