import { useCallback } from 'react'
import { apiUrl } from './env'
import type { GameRole } from './types'
import { useTrackEvent } from './use-track-event'

export const useSendMessage = (gameId: string) => {
  const trackEvent = useTrackEvent()
  const sendMessage = useCallback(
    async (message: { message: string; name: string; role: GameRole }): Promise<void> => {
      await fetch(`${apiUrl}/chess/game/${gameId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })

      trackEvent('send_message', {
        game_id: gameId,
        message: message.message,
        name: message.name,
        role: message.role,
      })
    },
    [trackEvent, gameId],
  )

  return sendMessage
}
