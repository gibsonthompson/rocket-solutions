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
      .select('stripe_account_id, slug')
      .eq('id', agencyId)
      .single()

    if (fetchError || !agency?.stripe_account_id) {
      return NextResponse.redirect(new URL('/agency/settings?error=no_account', request.url))
    }

    // Check if onboarding is complete
    const account = await stripe.accounts.retrieve(agency.stripe_account_id)
    const isComplete = account.charges_enabled && account.payouts_enabled

    // Update the database
    await supabase
      .from('agencies')
      .update({
        stripe_onboarding_complete: isComplete,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId)

    // Redirect back to settings with status
    const status = isComplete ? 'success' : 'pending'
    
    // Redirect to agency's subdomain settings page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tapstack.dev'
    const redirectUrl = agency.slug 
      ? `https://${agency.slug}.tapstack.dev/agency/settings?stripe_connect=${status}`
      : `${baseUrl}/agency/settings?stripe_connect=${status}`

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Stripe Connect return error:', error)
    return NextResponse.redirect(new URL('/agency/settings?error=stripe_error', request.url))
  }
}