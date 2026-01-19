import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const agencyId = searchParams.get('agency_id')

  if (!agencyId) {
    return NextResponse.redirect(new URL('/agency/settings?error=missing_agency', request.url))
  }

  const supabase = getSupabase()

  try {
    // Get agency's Stripe account ID
    const { data: agency, error: fetchError } = await supabase
      .from('agencies')
      .select('stripe_account_id')
      .eq('id', agencyId)
      .single()

    if (fetchError || !agency?.stripe_account_id) {
      return NextResponse.redirect(new URL('/agency/settings?error=no_account', request.url))
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tapstack.dev'

    // Create a new account link
    const accountLink = await stripe.accountLinks.create({
      account: agency.stripe_account_id,
      refresh_url: `${baseUrl}/api/agency/stripe-connect/refresh?agency_id=${agencyId}`,
      return_url: `${baseUrl}/api/agency/stripe-connect/return?agency_id=${agencyId}`,
      type: 'account_onboarding',
    })

    return NextResponse.redirect(accountLink.url)
  } catch (error) {
    console.error('Stripe Connect refresh error:', error)
    return NextResponse.redirect(new URL('/agency/settings?error=stripe_error', request.url))
  }
}