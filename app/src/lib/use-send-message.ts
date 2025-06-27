import { useCallback } from 'react'
import { apiUrl } from './env'
import type { GameRole } from './types'

export const useSendMessage = (gameId: string) => {
  const sendMessage = useCallback(async (message: { message: string; name: string; role: GameRole }): Promise<void> => {
    await fetch(`${apiUrl}/chess/game/${gameId}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
  }, [])

  return sendMessage
}
