import type { AuthContextType } from '@/lib/auth/types'
import { createContext } from 'react'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
