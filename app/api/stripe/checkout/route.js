import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  growth: process.env.STRIPE_PRICE_GROWTH,
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { plan, siteData } = body

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!siteData || !siteData.businessName || !siteData.email) {
      return NextResponse.json({ error: 'Missing site data' }, { status: 400 })
    }

    // Get the base URL from the request headers (more reliable than env var)
    const headersList = headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    
    // Use env var if available, otherwise construct from request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
    
    console.log('Checkout baseUrl:', baseUrl) // Debug log

    // Get company ID from siteData
    const companyId = siteData.siteId

    if (!companyId) {
      return NextResponse.json({ error: 'Missing company ID' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      customer_email: siteData.email,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&company_id=${companyId}`,
      cancel_url: `${baseUrl}/preview?cancelled=true`,
      metadata: {
        company_id: companyId,
        company_slug: siteData.companySlug,
        company_name: siteData.businessName,
        owner_name: siteData.ownerName || '',
        email: siteData.email,
        phone: siteData.phone || '',
        city: siteData.city || '',
        state: siteData.state || '',
        industry: siteData.industry || 'Junk Removal',
        tagline: siteData.tagline || '',
        primary_color: siteData.primaryColor || '#3B82F6',
        logo_background_color: siteData.logoBackgroundColor || '#020202',
        service_radius: siteData.serviceRadius?.toString() || '25',
        plan,
      },
      subscription_data: {
        metadata: {
          company_id: companyId,
          plan,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}