import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Default price IDs (used when agency doesn't have Stripe Connect)
const DEFAULT_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  growth: process.env.STRIPE_PRICE_GROWTH,
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { plan, siteData, agencyId } = body

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!siteData || !siteData.businessName || !siteData.email) {
      return NextResponse.json({ error: 'Missing site data' }, { status: 400 })
    }

    // Get the base URL from the request headers
    const headersList = headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}` // Always use request host, not env var

    // Get company ID from siteData
    const companyId = siteData.siteId

    if (!companyId) {
      return NextResponse.json({ error: 'Missing company ID' }, { status: 400 })
    }

    const supabase = getSupabase()
    let stripeAccountId = null
    let priceAmount = null
    let agency = null
    let successBaseUrl = baseUrl // Default to request host

    // If agencyId provided, get agency's Stripe Connect account, pricing, and domain
    if (agencyId) {
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('stripe_account_id, stripe_onboarding_complete, price_starter, price_pro, price_growth, marketing_domain, domain_verified, slug')
        .eq('id', agencyId)
        .single()

      if (!agencyError && agencyData) {
        agency = agencyData
        
        // Only use Connect if agency has completed onboarding
        if (agency.stripe_onboarding_complete && agency.stripe_account_id) {
          stripeAccountId = agency.stripe_account_id
        }

        // Get agency's custom pricing (stored in cents)
        const agencyPrices = {
          starter: agency.price_starter || 4900,
          pro: agency.price_pro || 9900,
          growth: agency.price_growth || 19900,
        }
        priceAmount = agencyPrices[plan]

        // Determine agency's domain for success redirect
        // Priority: verified marketing_domain > subdomain on tapstack.dev > request host
        if (agency.marketing_domain && agency.domain_verified) {
          successBaseUrl = `https://${agency.marketing_domain}`
        } else if (agency.slug) {
          successBaseUrl = `https://${agency.slug}.tapstack.dev`
        }
      }
    }

    let session

    if (stripeAccountId && priceAmount) {
      // ═══════════════════════════════════════════════════════════════
      // AGENCY CHECKOUT (Stripe Connect - Direct Charges)
      // Payment goes directly to agency's connected account
      // ═══════════════════════════════════════════════════════════════
      
      console.log('Creating checkout with Stripe Connect:', stripeAccountId)
      console.log('Success URL base:', successBaseUrl)

      // Create customer on connected account first (required for Accounts V2)
      const customer = await stripe.customers.create(
        {
          email: siteData.email,
          name: siteData.businessName,
          metadata: {
            company_id: companyId,
            company_name: siteData.businessName,
          }
        },
        { stripeAccount: stripeAccountId }
      )

      // Create a product and price on the connected account
      const product = await stripe.products.create(
        {
          name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Website Subscription`,
          metadata: {
            plan,
            company_id: companyId,
          }
        },
        { stripeAccount: stripeAccountId }
      )

      const price = await stripe.prices.create(
        {
          product: product.id,
          unit_amount: priceAmount,
          currency: 'usd',
          recurring: { interval: 'month' },
        },
        { stripeAccount: stripeAccountId }
      )

      // Create checkout session on connected account
      session = await stripe.checkout.sessions.create(
        {
          customer: customer.id,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          success_url: `${successBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&company_id=${companyId}&agency_id=${agencyId}`,
          cancel_url: `${successBaseUrl}/preview?cancelled=true`,
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
            agency_id: agencyId,
          },
          subscription_data: {
            metadata: {
              company_id: companyId,
              plan,
              agency_id: agencyId,
            },
          },
        },
        { stripeAccount: stripeAccountId }
      )

      // Update company record with agency info
      await supabase
        .from('junk_companies')
        .update({
          agency_id: agencyId,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

    } else {
      // ═══════════════════════════════════════════════════════════════
      // PLATFORM CHECKOUT (No Connect - Direct to platform)
      // Used when agency hasn't connected Stripe or for direct sales
      // ═══════════════════════════════════════════════════════════════

      if (!DEFAULT_PRICE_IDS[plan]) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      console.log('Creating standard platform checkout')
      console.log('Success URL base:', successBaseUrl)

      // Create customer first (required for Accounts V2 in test mode)
      const customer = await stripe.customers.create({
        email: siteData.email,
        name: siteData.businessName,
        metadata: {
          company_id: companyId,
          company_name: siteData.businessName,
        }
      })

      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: DEFAULT_PRICE_IDS[plan],
            quantity: 1,
          },
        ],
        success_url: `${successBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&company_id=${companyId}${agencyId ? `&agency_id=${agencyId}` : ''}`,
        cancel_url: `${successBaseUrl}/preview?cancelled=true`,
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
          agency_id: agencyId || null,
        },
        subscription_data: {
          metadata: {
            company_id: companyId,
            plan,
          },
        },
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}