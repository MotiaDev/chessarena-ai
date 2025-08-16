import type { User } from '@chessarena/types/user'
import { apiClient } from './api-client'

type AuthResponse = {
  userId: string
  accessToken: string
  user: User
}

export const authApi = {
  auth: async (authToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`/auth`, { authToken })

    apiClient.setAuthToken(response.accessToken)

    return response
  },
}
