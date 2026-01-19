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

export async function POST(request) {
  try {
    const { agencyId } = await request.json()

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Get agency details
    const { data: agency, error: fetchError } = await supabase
      .from('agencies')
      .select('id, name, owner_email, stripe_account_id')
      .eq('id', agencyId)
      .single()

    if (fetchError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    let accountId = agency.stripe_account_id

    // Create a new Connect account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: agency.owner_email,
        metadata: {
          agency_id: agencyId,
          agency_name: agency.name
        }
      })
      accountId = account.id

      // Save the account ID to the database
      await supabase
        .from('agencies')
        .update({ 
          stripe_account_id: accountId,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId)
    }

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tapstack.dev'

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/api/agency/stripe-connect/refresh?agency_id=${agencyId}`,
      return_url: `${baseUrl}/api/agency/stripe-connect/return?agency_id=${agencyId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Connect link' },
      { status: 500 }
    )
  }
}

// GET - Check Connect status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agency_id')

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: agency, error } = await supabase
      .from('agencies')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', agencyId)
      .single()

    if (error || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    if (!agency.stripe_account_id) {
      return NextResponse.json({ 
        connected: false, 
        onboarding_complete: false 
      })
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(agency.stripe_account_id)

    const isComplete = account.charges_enabled && account.payouts_enabled

    // Update database if status changed
    if (isComplete !== agency.stripe_onboarding_complete) {
      await supabase
        .from('agencies')
        .update({ 
          stripe_onboarding_complete: isComplete,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId)
    }

    return NextResponse.json({
      connected: true,
      onboarding_complete: isComplete,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: agency.stripe_account_id
    })
  } catch (error) {
    console.error('Stripe Connect status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check Connect status' },
      { status: 500 }
    )
  }
}