import { useCallback, useEffect, useState } from 'react'
import { apiClient } from './auth/api-client'
import { useAuth } from './auth/use-auth'
import type { GameWithRole } from './types'
import { useStreamEventHandler } from '@motiadev/stream-client-react'
import type { StreamSubscription } from '@motiadev/stream-client-browser'
import type { PublicUser } from '@chessarena/types/user'

type AccessRequest = {
  user: PublicUser
}

export const useGetGame = (gameId: string, event: StreamSubscription<unknown, unknown> | null) => {
  const { user } = useAuth()
  const [game, setGame] = useState<GameWithRole | undefined>()

  const getGame = useCallback(async (gameId: string) => {
    const data = await apiClient.get<GameWithRole>(`/chess/game/${gameId}`)
    setGame(data)
  }, [])

  const [accessRequest, setAccessRequest] = useState<AccessRequest[]>([])
  const onCancel = (userId: string) => {
    setAccessRequest((prev) => prev.filter((request) => request.user.id !== userId))
  }

  const refetch = useCallback(() => {
    getGame(gameId).catch(() => void 0)
  }, [gameId, getGame])

  useEffect(refetch, [refetch])

  useStreamEventHandler(
    {
      event,
      type: 'on-access-requested',
      listener: (event) => setAccessRequest((prev) => [...prev, event]),
    },
    [],
  )

  useStreamEventHandler(
    {
      event,
      type: 'on-access-accepted',
      listener: (event) => {
        if (event.userId === user?.id) refetch()
      },
    },
    [refetch, user?.id],
  )

  return { game, accessRequest, onCancel }
}
