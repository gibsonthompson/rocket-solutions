import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import bcrypt from 'bcryptjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  let event

  try {
    // Use the Connect webhook secret (different from regular webhook)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Connect webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Get the connected account ID from the event
  const connectedAccountId = event.account

  console.log('Connect webhook received:', event.type, 'from account:', connectedAccountId)

  const supabase = getSupabase()

  // Handle checkout completion from connected accounts
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    
    try {
      await handleConnectedCheckout(session, connectedAccountId, supabase)
    } catch (error) {
      console.error('Error handling connected checkout:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle subscription updates from connected accounts
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object
    await handleConnectedSubscriptionUpdate(subscription, connectedAccountId, supabase)
  }

  // Handle subscription cancellation from connected accounts
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await handleConnectedSubscriptionCancelled(subscription, connectedAccountId, supabase)
  }

  // Handle account updates (onboarding complete, etc.)
  if (event.type === 'account.updated') {
    const account = event.data.object
    await handleAccountUpdate(account, supabase)
  }

  return NextResponse.json({ received: true })
}

async function handleConnectedCheckout(session, connectedAccountId, supabase) {
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

  const subdomain = existingCompany.company_slug

  // Generate temporary password
  const tempPassword = generateTempPassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  // Update company record
  const { error: updateError } = await supabase
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
      plan: plan || 'starter',
      // Store connected account info instead of platform customer
      stripe_connected_account_id: connectedAccountId,
      stripe_customer_id: session.customer, // Customer on connected account
      stripe_subscription_id: session.subscription,
      agency_id: agency_id || null,
      dashboard_password_hash: hashedPassword,
      temp_password: tempPassword,
      is_active: true,
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', company_id)

  if (updateError) {
    console.error('Failed to update company:', updateError)
    throw updateError
  }

  // Provision the subdomain
  await provisionSubdomain(company_id, subdomain)

  console.log('═══════════════════════════════════════')
  console.log('✅ AGENCY CUSTOMER SETUP COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`Company: ${company_name}`)
  console.log(`Email: ${email}`)
  console.log(`Plan: ${plan}`)
  console.log(`Agency ID: ${agency_id}`)
  console.log(`Connected Account: ${connectedAccountId}`)
  console.log(`Subdomain: ${subdomain}.gorocketsolutions.com`)
  console.log(`Temp Password: ${tempPassword}`)
  console.log('═══════════════════════════════════════')

  return { success: true }
}

async function handleConnectedSubscriptionUpdate(subscription, connectedAccountId, supabase) {
  const plan = subscription.metadata?.plan || 'starter'
  
  console.log('═══════════════════════════════════════')
  console.log('📝 CONNECTED SUBSCRIPTION UPDATE')
  console.log('═══════════════════════════════════════')
  console.log(`Subscription ID: ${subscription.id}`)
  console.log(`Connected Account: ${connectedAccountId}`)
  console.log(`Status: ${subscription.status}`)
  console.log('═══════════════════════════════════════')

  // Find and update company by connected account subscription
  const { data, error } = await supabase
    .from('junk_companies')
    .update({
      plan,
      status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    .eq('stripe_connected_account_id', connectedAccountId)
    .select('id, company_name, email')
    .single()

  if (error) {
    console.error('Failed to update connected subscription:', error)
    return
  }

  if (data) {
    console.log(`✅ Updated ${data.company_name} (${data.email})`)
  }
}

async function handleConnectedSubscriptionCancelled(subscription, connectedAccountId, supabase) {
  console.log('═══════════════════════════════════════')
  console.log('❌ CONNECTED SUBSCRIPTION CANCELLED')
  console.log('═══════════════════════════════════════')
  console.log(`Subscription ID: ${subscription.id}`)
  console.log(`Connected Account: ${connectedAccountId}`)
  console.log('═══════════════════════════════════════')

  const { data, error } = await supabase
    .from('junk_companies')
    .update({
      is_active: false,
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
    .eq('stripe_connected_account_id', connectedAccountId)
    .select('id, company_name, email')
    .single()

  if (error) {
    console.error('Failed to handle connected cancellation:', error)
    return
  }

  if (data) {
    console.log(`✅ Deactivated ${data.company_name} (${data.email})`)
  }
}

async function handleAccountUpdate(account, supabase) {
  // Update agency's onboarding status when their account changes
  const isComplete = account.charges_enabled && account.payouts_enabled

  const { error } = await supabase
    .from('agencies')
    .update({
      stripe_onboarding_complete: isComplete,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_account_id', account.id)

  if (!error) {
    console.log(`Agency account ${account.id} updated - onboarding complete: ${isComplete}`)
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
    return response.ok ? { success: true, data } : { success: false, error: data.error }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

function generateTempPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}