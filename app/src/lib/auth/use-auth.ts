import { useContext } from 'react'
import { AuthContext } from '@/components/auth/auth-context'
import type { AuthContextType } from './types'

/**
 * Hook for accessing authentication context
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
