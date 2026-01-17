import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * POST /api/stripe/portal
 * Creates a Stripe Billing Portal session for existing subscribers to manage/upgrade
 * Body: { companyId }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('junk_companies')
      .select('id, stripe_customer_id, company_slug')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
    }

    // Determine return URL
    const baseUrl = company.company_slug 
      ? `https://${company.company_slug}.gorocketsolutions.com`
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://gorocketsolutions.com'

    // Create Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: `${baseUrl}/dashboard?billing=complete`,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}