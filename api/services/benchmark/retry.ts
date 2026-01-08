const sleep = async (ms: number) => {
  await new Promise((r) => setTimeout(r, ms))
}

const parseRetryAfterMs = (value: unknown): number | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  const seconds = Number.parseInt(trimmed, 10)
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000
  const dateMs = Date.parse(trimmed)
  if (!Number.isNaN(dateMs)) {
    const delta = dateMs - Date.now()
    return delta > 0 ? delta : 0
  }
  return undefined
}

const getStatusCode = (e: unknown): number | undefined => {
  const anyErr = e as any
  if (typeof anyErr?.statusCode === 'number') return anyErr.statusCode
  if (typeof anyErr?.cause?.statusCode === 'number') return anyErr.cause.statusCode
  return undefined
}

const getResponseHeaders = (e: unknown): Record<string, string> | undefined => {
  const anyErr = e as any
  const headers = anyErr?.responseHeaders ?? anyErr?.cause?.responseHeaders
  if (!headers || typeof headers !== 'object') return undefined
  return headers as Record<string, string>
}

export const isTransientError = (e: unknown): boolean => {
  const status = getStatusCode(e)
  if (status && [408, 425, 429, 500, 502, 503, 504, 529].includes(status)) return true
  const msg = e instanceof Error ? e.message : ''
  if (msg.includes('Headers Timeout')) return true
  if (msg.includes('Cannot connect to API')) return true
  return false
}

export const withRetries = async <T>(
  label: string,
  deadlineMs: number,
  transientRetries: number,
  retryBaseBackoffMs: number,
  fn: (abortSignal: AbortSignal) => Promise<T>,
): Promise<T> => {
  let attempt = 0
  while (true) {
    const remaining = deadlineMs - Date.now()
    if (remaining <= 0) throw new Error('Timed out before request could start')

    try {
      return await fn(AbortSignal.timeout(remaining))
    } catch (e) {
      attempt++
      if (attempt > transientRetries || !isTransientError(e)) throw e

      const headers = getResponseHeaders(e)
      const retryAfterMs = parseRetryAfterMs(headers?.['retry-after'] ?? headers?.['Retry-After'])
      const backoff = Math.min(30_000, retryBaseBackoffMs * 2 ** (attempt - 1))
      const jitter = Math.floor(Math.random() * 250)
      const waitMs = (retryAfterMs ?? backoff) + jitter

      const remainingAfterWait = deadlineMs - Date.now()
      if (remainingAfterWait <= 0) throw e
      await sleep(Math.min(waitMs, Math.max(0, remainingAfterWait - 100)))
    }
  }
}

export const withRetriesNoTimeout = async <T>(
  label: string,
  transientRetries: number,
  retryBaseBackoffMs: number,
  fn: () => Promise<T>,
): Promise<T> => {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (e) {
      attempt++
      if (attempt > transientRetries || !isTransientError(e)) throw e

      const headers = getResponseHeaders(e)
      const retryAfterMs = parseRetryAfterMs(headers?.['retry-after'] ?? headers?.['Retry-After'])
      const backoff = Math.min(30_000, retryBaseBackoffMs * 2 ** (attempt - 1))
      const jitter = Math.floor(Math.random() * 250)
      const waitMs = (retryAfterMs ?? backoff) + jitter

      await sleep(waitMs)
    }
  }
}
