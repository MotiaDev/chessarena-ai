import { useCallback } from 'react'

export const useTrackEvent = () => {
  const trackEvent = useCallback((event: string, params: Record<string, string | number>) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, params)
    }
  }, [])

  return trackEvent
}
