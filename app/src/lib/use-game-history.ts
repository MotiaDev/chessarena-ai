import { useCallback, useEffect, useState } from 'react'
import { apiClient } from './auth/api-client'
import type { GameHistory, GameHistoryFilter } from '@chessarena/types/game-history'

type GameHistoryListItem = Omit<GameHistory, 'moves' | 'messages'>

type GameHistoryResponse = {
  games: GameHistoryListItem[]
  total: number
  limit: number
  offset: number
}

export const useGameHistory = (initialFilter: Partial<GameHistoryFilter> = {}) => {
  const [games, setGames] = useState<GameHistoryListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Partial<GameHistoryFilter>>(initialFilter)

  const fetchHistory = useCallback(async (params: Partial<GameHistoryFilter> = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      Object.entries({ ...filter, ...params }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value))
        }
      })

      const response = await apiClient.get<GameHistoryResponse>(
        `/chess/history?${queryParams.toString()}`
      )
      setGames(response.games)
      setTotal(response.total)
    } catch (err) {
      setError('Failed to load game history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  const updateFilter = useCallback((newFilter: Partial<GameHistoryFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }))
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { games, total, loading, error, filter, updateFilter, refetch: fetchHistory }
}

export const useGameHistoryDetail = (gameId: string | null) => {
  const [game, setGame] = useState<GameHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGame = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<GameHistory>(`/chess/history/${id}`)
      setGame(response)
    } catch (err) {
      setError('Failed to load game details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (gameId) {
      fetchGame(gameId)
    }
  }, [gameId, fetchGame])

  return { game, loading, error, refetch: () => gameId && fetchGame(gameId) }
}
