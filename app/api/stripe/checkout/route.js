import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Price IDs for each plan - update these with your actual Stripe price IDs
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  growth: process.env.STRIPE_PRICE_GROWTH
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Handle both old format (direct fields) and new format (siteData wrapper)
    const { plan, siteData } = body
    
    // Extract data - support both formats
    const companyId = siteData?.siteId || body.companyId
    const email = siteData?.email || body.email
    const companyName = siteData?.businessName || body.companyName
    const ownerName = siteData?.ownerName || body.ownerName
    const phone = siteData?.phone || body.phone
    const city = siteData?.city || body.city
    const state = siteData?.state || body.state
    const industry = siteData?.industry || body.industry
    const tagline = siteData?.tagline || body.tagline
    const primaryColor = siteData?.primaryColor || body.primaryColor
    const logoBackgroundColor = siteData?.logoBackgroundColor || body.logoBackgroundColor
    // Don't pass logo through Stripe - it's already saved in DB during preview creation
    // Base64 logos are too large for Stripe metadata (500 char limit)
    const serviceRadius = siteData?.serviceRadius || body.serviceRadius
    const companySlug = siteData?.companySlug || body.companySlug

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID (siteId) required' }, { status: 400 })
    }

    if (!plan || !PRICE_IDS[plan]) {
      console.error('Invalid plan or missing price ID:', { plan, priceIds: PRICE_IDS })
      return NextResponse.json({ error: `Invalid plan: ${plan}. Make sure STRIPE_PRICE_${plan.toUpperCase()} is set.` }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const priceId = PRICE_IDS[plan]

    // Create Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        company_id: companyId,
        company_slug: companySlug || '',
        company_name: companyName || '',
        owner_name: ownerName || '',
        email: email,
        phone: phone || '',
        city: city || '',
        state: state || '',
        industry: industry || 'Junk Removal',
        tagline: tagline || '',
        primary_color: primaryColor || '#3B82F6',
        logo_background_color: logoBackgroundColor || '#020202',
        // logo_url intentionally omitted - already saved in DB, too large for Stripe
        service_radius: String(serviceRadius || 25),
        plan: plan
      },
      subscription_data: {
        metadata: {
          company_id: companyId
        }
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&company_id=${companyId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/preview?cancelled=true`
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}