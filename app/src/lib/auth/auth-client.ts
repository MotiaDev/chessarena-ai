import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '../env'

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
})
