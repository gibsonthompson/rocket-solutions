import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import bcrypt from 'bcryptjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_STARTER]: 'starter',
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_GROWTH]: 'growth',
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Get plan from subscription
async function getPlanFromSubscription(subscriptionId, stripeAccountId = null) {
  try {
    const options = stripeAccountId ? { stripeAccount: stripeAccountId } : {}
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, options)
    const priceId = subscription.items.data[0]?.price?.id
    return PRICE_TO_PLAN[priceId] || 'starter'
  } catch (error) {
    console.error('Error getting plan from subscription:', error)
    return 'starter'
  }
}

// Get plan from price ID
function getPlanFromPriceId(priceId) {
  return PRICE_TO_PLAN[priceId] || 'starter'
}

export async function POST(request) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook event received:', event.type)

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { company_id, agencyId } = session.metadata || {}

    // Skip agency signups - these are handled by tapstack webhook
    if (!company_id && agencyId) {
      console.log('Skipping agency signup - handled by tapstack webhook')
      return NextResponse.json({ received: true, skipped: 'agency_signup' })
    }

    // Skip if no company_id (shouldn't happen for customer signups)
    if (!company_id) {
      console.log('Skipping - no company_id in metadata')
      return NextResponse.json({ received: true, skipped: 'no_company_id' })
    }

    try {
      await handleCheckoutComplete(session)
    } catch (error) {
      console.error('Error handling checkout:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle subscription updates (upgrades/downgrades)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object
    await handleSubscriptionUpdate(subscription)
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await handleSubscriptionCancelled(subscription)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session) {
  const supabase = getSupabase()
  
  // Get metadata from checkout session
  const {
    company_id,
    company_name,
    owner_name,
    email,
    phone,
    city,
    state,
    industry,
    tagline,
    primary_color,
    logo_background_color,
    logo_url,
    service_radius,
    plan,
    agency_id
  } = session.metadata || {}

  if (!company_id) {
    throw new Error('No company_id in session metadata')
  }

  // Fetch existing record to preserve the slug
  const { data: existingCompany, error: fetchError } = await supabase
    .from('junk_companies')
    .select('id, company_slug')
    .eq('id', company_id)
    .single()

  if (fetchError || !existingCompany) {
    console.error('Company not found:', company_id, fetchError)
    throw new Error(`Company not found: ${company_id}`)
  }

  // Use EXISTING slug from database
  const subdomain = existingCompany.company_slug 
    || session.metadata.company_slug 
    || generateSubdomain(company_name)

  console.log('Using subdomain:', subdomain, '(from existing record)')

  // Generate temporary password
  const tempPassword = generateTempPassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  // Get the actual plan from the subscription (more reliable than metadata)
  let actualPlan = plan || 'starter'
  if (session.subscription) {
    actualPlan = await getPlanFromSubscription(session.subscription)
  }

  // Update company record
  const { data: company, error: updateError } = await supabase
    .from('junk_companies')
    .update({
      company_name,
      owner_name,
      email,
      phone,
      city,
      state,
      industry: industry || 'Junk Removal',
      tagline,
      primary_color: primary_color || '#3B82F6',
      logo_background_color: logo_background_color || '#020202',
      service_radius: parseInt(service_radius) || 25,
      plan: actualPlan,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      dashboard_password_hash: hashedPassword,
      temp_password: tempPassword,
      is_active: true,
      status: 'active',
      agency_id: agency_id || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', company_id)
    .select()
    .single()

  if (updateError) {
    console.error('Failed to update company:', updateError)
    throw updateError
  }

  // Provision the subdomain (Cloudflare DNS + Vercel domain)
  const provisionResult = await provisionSubdomain(company_id, subdomain)
  
  if (!provisionResult.success) {
    console.error('Subdomain provisioning failed:', provisionResult.error)
  }

  // Log the result
  console.log('═══════════════════════════════════════')
  console.log('✅ NEW CUSTOMER SETUP COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`Company: ${company_name}`)
  console.log(`Email: ${email}`)
  console.log(`Plan: ${actualPlan}`)
  console.log(`Subdomain: ${subdomain}.gorocketsolutions.com`)
  console.log(`Temp Password: ${tempPassword}`)
  console.log(`Dashboard: https://${subdomain}.gorocketsolutions.com/dashboard`)
  if (agency_id) console.log(`Agency ID: ${agency_id}`)
  console.log('═══════════════════════════════════════')

  return { success: true, subdomain, company }
}

async function handleSubscriptionUpdate(subscription) {
  const supabase = getSupabase()
  
  // Get the new plan from the subscription's price
  const priceId = subscription.items.data[0]?.price?.id
  const newPlan = getPlanFromPriceId(priceId)
  
  console.log('═══════════════════════════════════════')
  console.log('📝 SUBSCRIPTION UPDATE')
  console.log('═══════════════════════════════════════')
  console.log(`Subscription ID: ${subscription.id}`)
  console.log(`Status: ${subscription.status}`)
  console.log(`New Plan: ${newPlan}`)
  console.log(`Price ID: ${priceId}`)
  console.log('═══════════════════════════════════════')

  // Update company with new plan and status
  const { data, error } = await supabase
    .from('junk_companies')
    .update({
      plan: newPlan,
      status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('id, company_name, email')
    .single()

  if (error) {
    console.error('Failed to update subscription:', error)
    return
  }

  if (data) {
    console.log(`✅ Updated ${data.company_name} (${data.email}) to ${newPlan} plan`)
  }
}

async function handleSubscriptionCancelled(subscription) {
  const supabase = getSupabase()
  
  console.log('═══════════════════════════════════════')
  console.log('❌ SUBSCRIPTION CANCELLED')
  console.log('═══════════════════════════════════════')
  console.log(`Subscription ID: ${subscription.id}`)
  console.log('═══════════════════════════════════════')

  // Deactivate the company
  const { data, error } = await supabase
    .from('junk_companies')
    .update({
      is_active: false,
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    .select('id, company_name, email')
    .single()

  if (error) {
    console.error('Failed to handle subscription cancellation:', error)
    return
  }

  if (data) {
    console.log(`✅ Deactivated ${data.company_name} (${data.email})`)
  }
}

async function provisionSubdomain(companyId, subdomain) {
  const PROVISION_API_URL = process.env.PROVISION_API_URL || 'https://junklinellc.com/api/provision-subdomain'
  const PROVISION_API_SECRET = process.env.PROVISION_API_SECRET

  if (!PROVISION_API_SECRET) {
    return { success: false, error: 'PROVISION_API_SECRET not configured' }
  }

  try {
    const response = await fetch(PROVISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROVISION_API_SECRET}`
      },
      body: JSON.stringify({ companyId, subdomain })
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Provision API failed' }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

function generateSubdomain(businessName) {
  if (!businessName) return `site-${Date.now()}`
  
  let slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 30)

  const suffix = Math.random().toString(36).substring(2, 8)
  
  return `${slug}-${suffix}`
}

function generateTempPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}