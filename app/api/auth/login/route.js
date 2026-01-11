import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { password, siteId } = await request.json()

    if (!password || !siteId) {
      return NextResponse.json(
        { error: 'Password and site ID required' },
        { status: 400 }
      )
    }

    // Get site with password hash
    const { data: site, error } = await supabaseAdmin
      .from('rocket_sites')
      .select('id, dashboard_password_hash, business_name')
      .eq('id', siteId)
      .single()

    if (error || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    let isValid = false
    let requiresPasswordChange = false

    // If no password set yet, accept site ID as default password
    if (!site.dashboard_password_hash) {
      // Default password is the site ID (UUID)
      isValid = password === siteId
      
      if (isValid) {
        requiresPasswordChange = true
      }
    } else {
      // Verify against stored hash
      isValid = await bcrypt.compare(password, site.dashboard_password_hash)
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Return success with site ID for session
    return NextResponse.json({
      success: true,
      siteId: site.id,
      businessName: site.business_name,
      requiresPasswordChange
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
