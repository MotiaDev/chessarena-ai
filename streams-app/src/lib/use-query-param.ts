import { useCallback, useEffect, useState } from 'react'

export function useQueryParam(key: string) {
  const [value, setValue] = useState<string | undefined>(() => {
    const url = new URL(window.location.href)
    return url.searchParams.get(key) ?? undefined
  })

  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href)
      setValue(url.searchParams.get(key) ?? undefined)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [key])

  const updateValue = useCallback((newValue: string | undefined) => {
    const url = new URL(window.location.href)

    if (newValue === undefined) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, newValue)
    }

    setValue(newValue)

    window.history.pushState({}, '', url.toString())
  }, [])

  return [value, updateValue] as const
}
