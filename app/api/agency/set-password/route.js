import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { password, agencyId, currentPassword } = await request.json()

    if (!password || !agencyId) {
      return NextResponse.json(
        { error: 'Password and agency ID required' },
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

    // Get agency
    const { data: agency, error } = await supabase
      .from('agencies')
      .select('id, dashboard_password_hash')
      .eq('id', agencyId)
      .single()

    if (error || !agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // If password already exists, require and verify current password
    if (agency.dashboard_password_hash) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }
      const isValid = await bcrypt.compare(currentPassword, agency.dashboard_password_hash)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
    }
    // If no password exists yet, allow setting without current password

    // Hash new password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update in database
    const { error: updateError } = await supabase
      .from('agencies')
      .update({ dashboard_password_hash: hashedPassword })
      .eq('id', agency.id)

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
