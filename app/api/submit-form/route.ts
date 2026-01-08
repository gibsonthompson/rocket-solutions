import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, businessName, phone, email, industry, smsConsent } = body

    // Only require name, business, email, and industry - phone and SMS consent are OPTIONAL
    if (!fullName || !businessName || !email || !industry) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    const { data, error } = await supabase
      .from('rocket_solutions_leads')
      .insert([
        {
          full_name: fullName,
          business_name: businessName,
          phone: phone || null,
          email: email,
          industry: industry,
          sms_consent: smsConsent || false,
          ip_address: ip_address,
          user_agent: user_agent,
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}