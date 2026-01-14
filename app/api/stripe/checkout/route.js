import Stripe from 'stripe'
import { NextResponse } from 'next/server'

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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/preview`,
      metadata: {
        plan,
        businessName: siteData.businessName,
        industry: siteData.industry,
        phone: siteData.phone,
        city: siteData.city,
        state: siteData.state,
        siteDataJson: JSON.stringify({
          ownerName: siteData.ownerName,
          tagline: siteData.tagline,
          serviceRadius: siteData.serviceRadius,
          primaryColor: siteData.primaryColor,
          logoBackgroundColor: siteData.logoBackgroundColor,
        }),
      },
      subscription_data: {
        metadata: {
          plan,
          businessName: siteData.businessName,
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
