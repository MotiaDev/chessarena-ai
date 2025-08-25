import { apiClient } from '@/lib/auth/api-client'

export const useAcceptRequestAccess = () => {
  return async (gameId: string, userId: string) => {
    await apiClient.post(`/request-access/${gameId}/accept`, { userId })
  }
}
