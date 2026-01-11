import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { password, siteId, currentPassword } = await request.json()

    if (!password || !siteId) {
      return NextResponse.json(
        { error: 'Password and site ID required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Get site
    const { data: site, error } = await supabaseAdmin
      .from('rocket_sites')
      .select('id, dashboard_password_hash')
      .eq('id', siteId)
      .single()

    if (error || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    // If password already exists, require and verify current password
    if (site.dashboard_password_hash) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }
      const isValid = await bcrypt.compare(currentPassword, site.dashboard_password_hash)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
    }
    // If no password exists yet, allow setting without current password
    // (first-time setup after using default site ID password)

    // Hash new password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update in database
    const { error: updateError } = await supabaseAdmin
      .from('rocket_sites')
      .update({ dashboard_password_hash: hashedPassword })
      .eq('id', site.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
