import { useCallback } from 'react'
import { apiClient } from './auth/api-client'
import { useAuth } from './auth/use-auth'
import { useTrackEvent } from './use-track-event'

export const useSendMessage = (gameId: string) => {
  const trackEvent = useTrackEvent()
  const auth = useAuth()
  const sendMessage = useCallback(
    async (message: { message: string; name?: string }): Promise<void> => {
      await apiClient.post(`/chess/game/${gameId}/send-message`, message)

      trackEvent('send_message', {
        game_id: gameId,
        message: message.message,
        name: auth.user?.name ?? message.name ?? '',
      })
    },
    [trackEvent, gameId, auth],
  )

  return sendMessage
}
