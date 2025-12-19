export const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
  onComplete?: (index: number, result: R) => void,
): Promise<R[]> => {
  const results = new Array<R>(items.length)
  const limit = Math.max(1, Math.min(concurrency, items.length))

  let nextIndex = 0

  const worker = async () => {
    while (true) {
      const index = nextIndex++
      if (index >= items.length) return
      const result = await mapper(items[index], index)
      results[index] = result
      onComplete?.(index, result)
    }
  }

  await Promise.all(Array.from({ length: limit }, worker))
  return results
}
