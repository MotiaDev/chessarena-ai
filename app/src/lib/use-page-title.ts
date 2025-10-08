import { useEffect } from 'react'
import { useTrackEvent } from './use-track-event'

export const usePageTitle = (title: string) => {
  const trackEvent = useTrackEvent()
  useEffect(() => {
    document.title = `ChessArena.ai - ${title}`
    trackEvent('page_view', { page_title: title })
  }, [title])
}
