import { apiClient } from '@/lib/auth/api-client'

export const useRequestAccess = () => {
  return async (gameId: string) => {
    await apiClient.post(`/request-access/${gameId}`)
  }
}
