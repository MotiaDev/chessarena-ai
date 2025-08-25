import { apiClient } from '@/lib/auth/api-client'
import { authApi } from '@/lib/auth/auth-api'
import { AuthService } from '@/lib/auth/auth-service'
import { getAuthParamsFromUrl, handleAuthError } from '@/lib/auth/auth-utils'
import type { AuthError, SupabaseError } from '@/lib/auth/types'
import type { User } from '@chessarena/types/user'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from './auth-context'

const useUserState = () => {
  const [user, _setUser] = useState<User | null>(null)

  const setUser = useCallback((user: User | null) => {
    _setUser(user)
    localStorage.setItem('motia-user', JSON.stringify(user))
  }, [])

  useEffect(() => {
    const localStorageUser = localStorage.getItem('motia-user')
    setUser(localStorageUser ? JSON.parse(localStorageUser) : null)
  }, [setUser])

  return [user, setUser] as const
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useUserState()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const params = getAuthParamsFromUrl()
    const fetchUser = async () => {
      setAuthError(null)
      setIsLoading(true)

      try {
        const session = await AuthService.getSession()

        if (session) {
          const result = await authApi.auth(session.access_token)
          const redirect = localStorage.getItem('chessarena-redirect')
          setUser(result.user)

          if (redirect) {
            navigate(redirect)
            localStorage.removeItem('chessarena-redirect')
          }
        }
      } catch (error: unknown) {
        console.error('Auth state change error:', error)
        setAuthError(handleAuthError(error))
      } finally {
        setIsLoading(false)
      }
    }

    if (params.error) {
      setAuthError({
        error: params.error,
        error_code: params.error_code || '',
        error_description: params.error_description || '',
      })
      return
    }

    if (params.access_token || !apiClient.isAuthenticated()) {
      fetchUser()
    }
  }, [setUser])

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      await AuthService.login(email, password)
    } catch (error: unknown) {
      console.error('Login error:', error)
      const supabaseError = error as SupabaseError
      setAuthError({
        error: supabaseError.message || 'Failed to log in',
        error_code: supabaseError.code || '',
        error_description: '',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const { session } = await AuthService.verifyOtp(email, token)
      if (session?.access_token) {
        const result = await authApi.auth(session.access_token)
        setUser(result.user)
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      const supabaseError = error as SupabaseError
      setAuthError({
        error: supabaseError.message || 'Failed to log in',
        error_code: supabaseError.code || '',
        error_description: '',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithMagicLink = useCallback(async (email: string): Promise<void> => {
    setAuthError(null)
    setIsLoading(true)

    try {
      await AuthService.loginWithMagicLink(email)
    } catch (error: unknown) {
      console.error('Magic link error:', error)
      setAuthError(handleAuthError(error))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithOAuth = useCallback(async (provider: 'google' | 'twitter'): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      await AuthService.loginWithOAuth(provider)
    } catch (error: unknown) {
      console.error('OAuth login error:', error)
      setAuthError(handleAuthError(error))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      await AuthService.logout()
      setUser(null)
    } catch (error: unknown) {
      console.error('Logout error:', error)
      setAuthError(handleAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }, [setUser])

  const isAuthenticated = apiClient.isAuthenticated()

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      authError,
      login,
      loginWithMagicLink,
      loginWithOAuth,
      logout,
      verifyOtp,
    }),
    [authError, isAuthenticated, isLoading, login, loginWithMagicLink, loginWithOAuth, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
