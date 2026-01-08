export const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * Maps items with limited concurrency.
 * Note: This is safe in JavaScript's single-threaded event loop because
 * synchronous operations (like incrementing nextIndex) are atomic between await points.
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
  onComplete?: (index: number, result: R) => void,
): Promise<R[]> => {
  const results = new Array<R>(items.length)
  const limit = Math.max(1, Math.min(concurrency, items.length))

  // Use a queue-based approach that's more explicit about concurrency control
  const queue = items.map((_, i) => i)

  const worker = async () => {
    while (queue.length > 0) {
      const index = queue.shift()
      if (index === undefined) return

      const result = await mapper(items[index], index)
      results[index] = result
      onComplete?.(index, result)
    }
  }

  await Promise.all(Array.from({ length: limit }, worker))
  return results
}
