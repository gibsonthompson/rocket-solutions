import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function generateSlug(businessName) {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36)
}

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        const { plan, businessName, industry, phone, city, state } = session.metadata
        const siteDataJson = session.metadata.siteDataJson
        const additionalData = siteDataJson ? JSON.parse(siteDataJson) : {}
        
        const companySlug = generateSlug(businessName)
        const tempPassword = generatePassword()
        const passwordHash = await bcrypt.hash(tempPassword, 10)
        
        // Insert into junk_companies (what Junk Line template reads)
        const { data: company, error } = await supabaseAdmin
          .from('junk_companies')
          .insert({
            company_name: businessName,
            company_slug: companySlug,
            phone: phone || '',
            email: session.customer_email,
            city: city || '',
            state: state || '',
            industry: industry || 'Home Services',
            primary_color: additionalData.primaryColor || '#3B82F6',
            secondary_color: additionalData.logoBackgroundColor || '#1f2937',
            logo_url: additionalData.logoUrl || '',
            hero_headline: `Professional ${industry || 'Services'} in ${city || 'Your Area'}`,
            hero_subheadline: additionalData.tagline || `Quality ${industry?.toLowerCase() || 'services'} you can trust.`,
            hero_features: JSON.stringify([
              'Licensed & Insured',
              'Free Estimates', 
              'Same-Day Service Available'
            ]),
            service_areas: JSON.stringify([
              { county: `${city} Area`, cities: [city, 'Surrounding Areas'] }
            ]),
            google_rating: '5.0',
            google_review_count: '0',
            is_active: true,
            dashboard_password_hash: passwordHash,
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating company:', error)
          throw error
        }

        // Also track in rocket_sites for billing
        await supabaseAdmin
          .from('rocket_sites')
          .insert({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan,
            status: 'active',
            business_name: businessName,
            industry,
            email: session.customer_email,
            phone,
            city,
            state,
            company_slug: companySlug,
            junk_company_id: company.id,
          })

        // Log for now - later send email
        console.log(`
===== NEW SITE CREATED =====
Business: ${businessName}
Slug: ${companySlug}
URL: https://${companySlug}.rocketsites.io
Temp Password: ${tempPassword}
============================
        `)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        await supabaseAdmin
          .from('rocket_sites')
          .update({ 
            status: subscription.status === 'active' ? 'active' : 'paused',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        const { data: site } = await supabaseAdmin
          .from('rocket_sites')
          .select('junk_company_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
          
        if (site?.junk_company_id) {
          await supabaseAdmin
            .from('junk_companies')
            .update({ is_active: subscription.status === 'active' })
            .eq('id', site.junk_company_id)
        }
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        const { data: site } = await supabaseAdmin
          .from('rocket_sites')
          .select('id, junk_company_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        await supabaseAdmin
          .from('rocket_sites')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (site?.junk_company_id) {
          await supabaseAdmin
            .from('junk_companies')
            .update({ is_active: false })
            .eq('id', site.junk_company_id)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        
        const { data: site } = await supabaseAdmin
          .from('rocket_sites')
          .update({ 
            status: 'paused',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoice.customer)
          .select('junk_company_id')
          .single()

        if (site?.junk_company_id) {
          await supabaseAdmin
            .from('junk_companies')
            .update({ is_active: false })
            .eq('id', site.junk_company_id)
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}