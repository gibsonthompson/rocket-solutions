import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      agencyId, 
      logo_url, 
      logo_background_color,
      primary_color,
      secondary_color,
      brand_palette,
      name,
      tagline,
      support_email,
      support_phone,
      price_starter,
      price_pro,
      price_growth
    } = body

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    // Build update object with only provided fields
    const updateData = {}
    
    if (logo_url !== undefined) updateData.logo_url = logo_url
    if (logo_background_color !== undefined) updateData.logo_background_color = logo_background_color
    if (primary_color !== undefined) updateData.primary_color = primary_color
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color
    if (brand_palette !== undefined) updateData.brand_palette = brand_palette
    if (name !== undefined) updateData.name = name
    if (tagline !== undefined) updateData.tagline = tagline
    if (support_email !== undefined) updateData.support_email = support_email
    if (support_phone !== undefined) updateData.support_phone = support_phone
    if (price_starter !== undefined) updateData.price_starter = price_starter
    if (price_pro !== undefined) updateData.price_pro = price_pro
    if (price_growth !== undefined) updateData.price_growth = price_growth
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('id', agencyId)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update agency' }, { status: 500 })
    }

    return NextResponse.json({ success: true, agency: data })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}