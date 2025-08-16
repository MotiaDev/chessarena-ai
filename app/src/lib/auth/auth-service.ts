import type { Session, User } from '@supabase/supabase-js'
import { apiClient } from './api-client'
import { supabaseClient } from './auth-client'

export class AuthService {
  static async login(email: string, password: string) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

    if (error) {
      throw error
    }
  }

  static async getSession(): Promise<Session | null> {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession()
    if (error) {
      throw error
    }
    return session
  }

  static async loginWithMagicLink(email: string) {
    const { error } = await supabaseClient.auth.signInWithOtp({ email })

    if (error) {
      throw error
    }
  }

  static async verifyOtp(email: string, token: string) {
    const { data, error } = await supabaseClient.auth.verifyOtp({ email, token, type: 'magiclink' })

    if (error) {
      throw error
    }

    return data
  }

  static async loginWithOAuth(provider: 'google' | 'twitter') {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      throw error
    }
  }

  static async logout() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) {
      throw error
    }
    apiClient.clearAuthToken()
  }

  static async resetPassword(email: string) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email)

    if (error) {
      throw error
    }
  }

  static async updateProfile(data: Partial<User>) {
    const { error, data: updatedData } = await supabaseClient.auth.updateUser({
      data,
    })
    if (error) {
      throw error
    }
    return updatedData.user.user_metadata
  }
}
