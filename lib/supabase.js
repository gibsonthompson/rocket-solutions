import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Server-side Supabase client (for API routes only)
// Only create if service role key exists (server-side)
export const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      supabaseUrl || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null