import { Navigate } from 'react-router'
import { useAuth } from '../../lib/auth/use-auth'
import type { PropsWithChildren } from 'react'

export const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth()

  if (!auth.isAuthenticated && !auth.isLoading) {
    return <Navigate to="/login" />
  }

  return children
}
