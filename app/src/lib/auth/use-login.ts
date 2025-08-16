import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { useNavigate } from 'react-router'

type LoginState = {
  error: string | null
  success: {
    title: string
    description: string
  } | null
}

type LoginProvider = 'google' | 'twitter' | 'email'

type AuthError = {
  error: string
  error_code: string
  error_description: string
}

const INITIAL_STATE: LoginState = {
  error: null,
  success: null,
}

const formatErrorMessage = (error: AuthError): string => {
  if (error.error_code === 'signup_disabled') {
    return 'Sign up is not allowed for this instance. Please contact your administrator.'
  }
  return error.error_description || error.error || 'Authentication failed'
}

export const useLogin = () => {
  const { loginWithOAuth, loginWithMagicLink, verifyOtp, authError, isAuthenticated, isLoading } = useAuth()
  const [state, setState] = useState<LoginState>(INITIAL_STATE)
  const navigate = useNavigate()

  useEffect(() => {
    if (authError) {
      setState((prev) => ({ ...prev, error: formatErrorMessage(authError) }))
    }
  }, [authError])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (provider: LoginProvider, options: { email?: string } = {}) => {
    try {
      setState((prev) => ({ ...prev, error: null, success: null }))

      if (provider === 'email') {
        if (!options.email?.trim()) {
          throw new Error('Email is required')
        }

        await loginWithMagicLink(options.email)

        setState((prev) => ({
          ...prev,
          success: {
            title: 'Email sent',
            description: 'Check your email for a magic link to sign in.',
          },
        }))
      } else {
        await loginWithOAuth(provider)

        setState((prev) => ({
          ...prev,
          success: {
            title: 'Please wait',
            description: 'Redirecting to your provider...',
          },
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error logging in',
      }))
    }
  }

  return {
    handleLogin,
    verifyOtp,
    isAuthenticating: isLoading,
    error: state.error,
    successMessage: state.success,
  }
}
