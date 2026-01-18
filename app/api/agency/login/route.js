import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Get agency by owner email
    const { data: agency, error } = await supabase
      .from('agencies')
      .select('id, slug, name, dashboard_password_hash, owner_email')
      .eq('owner_email', email.toLowerCase())
      .eq('status', 'active')
      .single()

    if (error || !agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    let isValid = false

    // If no password set yet, accept slug as default password
    if (!agency.dashboard_password_hash) {
      isValid = password === agency.slug
      
      if (isValid) {
        // Return flag to prompt password change
        return NextResponse.json({
          success: true,
          agencyId: agency.id,
          agencySlug: agency.slug,
          requiresPasswordChange: true
        })
      }
    } else {
      // Verify against stored hash
      isValid = await bcrypt.compare(password, agency.dashboard_password_hash)
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Return success with agency ID for session
    return NextResponse.json({
      success: true,
      agencyId: agency.id,
      agencySlug: agency.slug
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}