import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface RocketSolutionsLead {
  id?: string
  created_at?: string
  full_name: string
  business_name: string
  phone: string
  email: string
  industry: string
  sms_consent: boolean
  ip_address?: string
  user_agent?: string
}
