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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    try {
      await handleCheckoutComplete(session)
    } catch (error) {
      console.error('Error handling checkout:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle subscription updates (for future use)
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
    plan
  } = session.metadata || {}

  if (!company_id) {
    throw new Error('No company_id in session metadata')
  }

  // ═══════════════════════════════════════════════════════════════
  // FIX: Fetch existing record to preserve the slug
  // ═══════════════════════════════════════════════════════════════
  const { data: existingCompany, error: fetchError } = await supabase
    .from('junk_companies')
    .select('id, company_slug')
    .eq('id', company_id)
    .single()

  if (fetchError || !existingCompany) {
    console.error('Company not found:', company_id, fetchError)
    throw new Error(`Company not found: ${company_id}`)
  }

  // Use EXISTING slug from database, fall back to metadata, then generate as last resort
  const subdomain = existingCompany.company_slug 
    || session.metadata.company_slug 
    || generateSubdomain(company_name)

  console.log('Using subdomain:', subdomain, '(from existing record)')

  // Generate temporary password
  const tempPassword = generateTempPassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  // Update company record
  // IMPORTANT: DO NOT overwrite company_slug or logo_url - they're already saved during preview
  const { data: company, error: updateError } = await supabase
    .from('junk_companies')
    .update({
      company_name,
      // company_slug: PRESERVED - already set during preview, don't overwrite
      // logo_url: PRESERVED - already saved during preview (too large for Stripe metadata)
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
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      dashboard_password_hash: hashedPassword,  // Login checks this column
      temp_password: tempPassword, // Store plain password temporarily for success page
      is_active: true,
      status: 'active',
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
    // Don't throw - company is created, just log the issue
  }

  // Log the result (replace with email sending later)
  console.log('═══════════════════════════════════════')
  console.log('✅ NEW CUSTOMER SETUP COMPLETE')
  console.log('═══════════════════════════════════════')
  console.log(`Company: ${company_name}`)
  console.log(`Email: ${email}`)
  console.log(`Plan: ${plan}`)
  console.log(`Subdomain: ${subdomain}.gorocketsolutions.com`)
  console.log(`Temp Password: ${tempPassword}`)
  console.log(`Dashboard: https://${subdomain}.gorocketsolutions.com/dashboard`)
  console.log('═══════════════════════════════════════')

  // TODO: Send welcome email with credentials
  // await sendWelcomeEmail({
  //   to: email,
  //   companyName: company_name,
  //   subdomain,
  //   tempPassword,
  //   dashboardUrl: `https://${subdomain}.gorocketsolutions.com/dashboard`
  // })

  return { success: true, subdomain, company }
}

async function handleSubscriptionUpdate(subscription) {
  // Find company by stripe_subscription_id and update status
  const supabase = getSupabase()
  const { error } = await supabase
    .from('junk_companies')
    .update({
      status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to update subscription status:', error)
  }
}

async function handleSubscriptionCancelled(subscription) {
  // Deactivate the company
  const supabase = getSupabase()
  const { error } = await supabase
    .from('junk_companies')
    .update({
      is_active: false,
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to handle subscription cancellation:', error)
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
  
  // Convert to lowercase, replace spaces and special chars with hyphens
  let slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 30) // Keep it reasonable length

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8)
  
  return `${slug}-${suffix}`
}

function generateTempPassword() {
  // Generate a simple 6-digit PIN
  return Math.floor(100000 + Math.random() * 900000).toString()
}