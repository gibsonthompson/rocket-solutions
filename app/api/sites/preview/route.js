import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Industry-specific default services
const industryServices = {
  'Junk Removal': [
    { service_name: 'Full Junk Removal', service_slug: 'full-junk-removal', description: 'Complete cleanout of unwanted items from your home or business. We handle the heavy lifting, loading, and responsible disposal.', base_price: 199, features: ['Same-day service available', 'We do all the lifting', 'Eco-friendly disposal', 'Free on-site estimates'] },
    { service_name: 'Furniture Removal', service_slug: 'furniture-removal', description: 'Old couch? Broken dresser? We\'ll remove any furniture items quickly and dispose of them properly.', base_price: 99, features: ['Single item pickup', 'Apartment-friendly', 'Donation drop-off included', 'No item too heavy'] },
    { service_name: 'Appliance Hauling', service_slug: 'appliance-hauling', description: 'Safe removal of refrigerators, washers, dryers, and other appliances with proper recycling.', base_price: 79, features: ['Freon-safe removal', 'Recycling included', 'Disconnect service', 'Same-day available'] },
    { service_name: 'Estate Cleanouts', service_slug: 'estate-cleanouts', description: 'Compassionate and thorough estate clearing services. We work with families during difficult transitions.', base_price: 499, features: ['Full property clearing', 'Sorting assistance', 'Donation coordination', 'Flexible scheduling'] },
    { service_name: 'Construction Debris', service_slug: 'construction-debris', description: 'Post-renovation cleanup including drywall, lumber, tiles, and general construction waste.', base_price: 299, features: ['Contractor-friendly', 'Large capacity trucks', 'Same-day service', 'Competitive rates'] },
    { service_name: 'Yard Waste Removal', service_slug: 'yard-waste-removal', description: 'Branches, leaves, soil, and landscaping debris removed and disposed of properly.', base_price: 149, features: ['Green waste recycling', 'Heavy debris OK', 'Post-storm cleanup', 'Bulk discounts'] },
  ],
  'Landscaping': [
    { service_name: 'Lawn Maintenance', service_slug: 'lawn-maintenance', description: 'Regular mowing, edging, and trimming to keep your lawn looking pristine all season long.', base_price: 49, features: ['Weekly/bi-weekly plans', 'Edging included', 'Clipping cleanup', 'Seasonal pricing'] },
    { service_name: 'Garden Design', service_slug: 'garden-design', description: 'Custom garden layouts featuring native plants, flowers, and sustainable landscaping solutions.', base_price: 299, features: ['Free consultation', 'Native plant focus', '3D renderings', 'Installation included'] },
    { service_name: 'Tree & Shrub Care', service_slug: 'tree-shrub-care', description: 'Professional pruning, shaping, and health treatments for trees and shrubs of all sizes.', base_price: 149, features: ['Certified arborists', 'Disease treatment', 'Storm damage repair', 'Stump grinding'] },
    { service_name: 'Irrigation Systems', service_slug: 'irrigation-systems', description: 'Smart sprinkler installation and repair to keep your landscape healthy while saving water.', base_price: 399, features: ['Smart controllers', 'Drip systems', 'Seasonal adjustments', 'Leak detection'] },
    { service_name: 'Hardscaping', service_slug: 'hardscaping', description: 'Patios, walkways, retaining walls, and outdoor living spaces built to last.', base_price: 999, features: ['Custom designs', 'Quality materials', 'Drainage solutions', 'Permit handling'] },
    { service_name: 'Seasonal Cleanup', service_slug: 'seasonal-cleanup', description: 'Spring and fall cleanup services including leaf removal, bed preparation, and winterization.', base_price: 199, features: ['Leaf removal', 'Bed cleanup', 'Gutter clearing', 'Mulch refresh'] },
  ],
  'Pressure Washing': [
    { service_name: 'House Washing', service_slug: 'house-washing', description: 'Gentle soft washing for siding, stucco, and exterior surfaces. Removes dirt, mold, and mildew.', base_price: 249, features: ['Safe for all siding', 'Mold & mildew removal', 'Window-safe process', 'Eco-friendly soaps'] },
    { service_name: 'Driveway Cleaning', service_slug: 'driveway-cleaning', description: 'High-pressure cleaning for concrete, pavers, and asphalt driveways and walkways.', base_price: 149, features: ['Oil stain treatment', 'Weed removal', 'Sealing available', 'Same-day service'] },
    { service_name: 'Deck & Patio Restoration', service_slug: 'deck-patio-restoration', description: 'Bring your outdoor living spaces back to life with professional pressure washing and treatment.', base_price: 199, features: ['Wood-safe pressure', 'Staining available', 'Composite decks OK', 'Furniture moving'] },
    { service_name: 'Roof Cleaning', service_slug: 'roof-cleaning', description: 'Soft wash roof cleaning to remove black streaks, algae, and extend shingle life.', base_price: 349, features: ['No high pressure', 'Algae treatment', 'Gutter flush included', 'Warranty-safe'] },
    { service_name: 'Commercial Pressure Washing', service_slug: 'commercial-pressure-washing', description: 'Storefronts, parking lots, and commercial buildings cleaned to professional standards.', base_price: 499, features: ['After-hours service', 'Regular contracts', 'Large area capacity', 'Graffiti removal'] },
    { service_name: 'Gutter Cleaning', service_slug: 'gutter-cleaning', description: 'Complete gutter and downspout cleaning with optional pressure washing of exteriors.', base_price: 129, features: ['Debris removal', 'Downspout flush', 'Minor repairs', 'Before/after photos'] },
  ],
  'Plumbing': [
    { service_name: 'Emergency Repairs', service_slug: 'emergency-repairs', description: '24/7 emergency plumbing service for burst pipes, major leaks, and sewage backups.', base_price: 149, features: ['24/7 availability', 'Fast response', 'Upfront pricing', 'Licensed plumbers'] },
    { service_name: 'Drain Cleaning', service_slug: 'drain-cleaning', description: 'Professional drain clearing using hydro jetting and snake equipment for stubborn clogs.', base_price: 99, features: ['Camera inspection', 'Hydro jetting', 'Root removal', 'Preventive treatment'] },
    { service_name: 'Water Heater Service', service_slug: 'water-heater-service', description: 'Installation, repair, and maintenance for tank and tankless water heaters.', base_price: 199, features: ['Same-day install', 'Tankless experts', 'Energy efficient', 'Warranty service'] },
    { service_name: 'Fixture Installation', service_slug: 'fixture-installation', description: 'Professional installation of faucets, toilets, sinks, and other plumbing fixtures.', base_price: 129, features: ['All brands', 'Supply included', 'Old fixture removal', 'Leak warranty'] },
    { service_name: 'Pipe Repair & Replacement', service_slug: 'pipe-repair-replacement', description: 'Repair or replace damaged, corroded, or leaking pipes throughout your home.', base_price: 249, features: ['Trenchless options', 'Copper & PEX', 'Leak detection', 'Full repiping'] },
    { service_name: 'Sewer Line Service', service_slug: 'sewer-line-service', description: 'Sewer line inspection, cleaning, repair, and replacement services.', base_price: 299, features: ['Video inspection', 'Trenchless repair', 'Root treatment', 'Line locating'] },
  ],
  'House Cleaning': [
    { service_name: 'Standard Cleaning', service_slug: 'standard-cleaning', description: 'Regular maintenance cleaning including dusting, vacuuming, mopping, and bathroom sanitizing.', base_price: 129, features: ['Weekly/bi-weekly', 'Trusted cleaners', 'Supplies included', 'Satisfaction guaranteed'] },
    { service_name: 'Deep Cleaning', service_slug: 'deep-cleaning', description: 'Thorough top-to-bottom cleaning reaching areas often missed during regular cleaning.', base_price: 249, features: ['Inside appliances', 'Baseboards & vents', 'Light fixtures', 'Cabinet fronts'] },
    { service_name: 'Move In/Out Cleaning', service_slug: 'move-in-out-cleaning', description: 'Complete cleaning for empty homes, ensuring move-in ready condition.', base_price: 299, features: ['Empty home pricing', 'Deposit-back guarantee', 'Same-day available', 'All rooms included'] },
    { service_name: 'Post-Construction Cleaning', service_slug: 'post-construction-cleaning', description: 'Specialized cleaning to remove construction dust, debris, and residue.', base_price: 399, features: ['Dust removal', 'Window cleaning', 'Debris hauling', 'Final polish'] },
    { service_name: 'Office Cleaning', service_slug: 'office-cleaning', description: 'Professional cleaning services for offices and commercial spaces.', base_price: 199, features: ['After-hours service', 'Daily/weekly plans', 'Restroom sanitizing', 'Break room cleaning'] },
    { service_name: 'Specialty Cleaning', service_slug: 'specialty-cleaning', description: 'Carpet cleaning, window washing, and other specialized cleaning services.', base_price: 149, features: ['Carpet shampooing', 'Window washing', 'Upholstery cleaning', 'Tile & grout'] },
  ],
  'default': [
    { service_name: 'Basic Service', service_slug: 'basic-service', description: 'Our standard service package designed to meet your everyday needs with quality and care.', base_price: 99, features: ['Professional service', 'Quality guaranteed', 'Flexible scheduling', 'Upfront pricing'] },
    { service_name: 'Premium Service', service_slug: 'premium-service', description: 'Enhanced service with additional attention to detail and premium features.', base_price: 199, features: ['Priority scheduling', 'Extended service', 'Premium materials', 'Follow-up included'] },
    { service_name: 'Complete Package', service_slug: 'complete-package', description: 'Our most comprehensive service option for customers who want the full treatment.', base_price: 349, features: ['Everything included', 'White glove service', 'Satisfaction guaranteed', 'Ongoing support'] },
    { service_name: 'Emergency Service', service_slug: 'emergency-service', description: 'Same-day and after-hours service for urgent situations that can\'t wait.', base_price: 149, features: ['24/7 available', 'Fast response', 'No overtime fees', 'Direct communication'] },
    { service_name: 'Maintenance Plan', service_slug: 'maintenance-plan', description: 'Regular scheduled service to keep everything running smoothly.', base_price: 79, features: ['Monthly visits', 'Priority booking', 'Discounted rates', 'Preventive care'] },
    { service_name: 'Consultation', service_slug: 'consultation', description: 'Expert assessment and recommendations for your specific situation.', base_price: 0, features: ['Free estimates', 'No obligation', 'Expert advice', 'Written quote'] },
  ],
}

// Sample testimonials (work for any industry)
const sampleTestimonials = [
  { customer_name: 'Sarah M.', rating: 5, review_text: 'Absolutely fantastic service! They were on time, professional, and the quality of work exceeded my expectations. Will definitely use again.', service_type: 'General Service', is_featured: true },
  { customer_name: 'James R.', rating: 5, review_text: 'Best experience I\'ve had with a service company in years. Fair pricing, great communication, and they really care about doing the job right.', service_type: 'General Service', is_featured: true },
  { customer_name: 'Michelle K.', rating: 5, review_text: 'From the first phone call to job completion, everything was seamless. Highly recommend to anyone looking for reliable, quality service.', service_type: 'General Service', is_featured: false },
  { customer_name: 'David L.', rating: 5, review_text: 'These folks are the real deal. Professional, courteous, and they cleaned up after themselves. You can tell they take pride in their work.', service_type: 'General Service', is_featured: false },
  { customer_name: 'Amanda T.', rating: 5, review_text: 'I was impressed by how responsive they were to my questions and how quickly they were able to fit me into their schedule. Great job all around!', service_type: 'General Service', is_featured: true },
]

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      businessName, 
      industry, 
      email, 
      phone, 
      city, 
      state, 
      serviceRadius,
      logoPreview,  // base64 from onboarding
      logoBackgroundColor,
      primaryColor,
      tagline 
    } = body

    // Generate slug with high randomness to avoid collisions
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30)
    
    const companySlug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`

    // Check if any entry already exists for this email (preview or otherwise)
    const { data: existingPreview } = await supabase
      .from('junk_companies')
      .select('id, company_slug, status')
      .eq('email', email)
      .in('status', ['preview', 'active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let companyId, finalSlug

    if (existingPreview) {
      // Update existing preview
      const { data: updated, error: updateError } = await supabase
        .from('junk_companies')
        .update({
          company_name: businessName,
          industry,
          phone,
          city,
          state,
          service_radius: serviceRadius,
          logo_url: logoPreview,  // base64 from onboarding
          logo_background_color: logoBackgroundColor,
          primary_color: primaryColor || '#3B82F6',
          tagline,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPreview.id)
        .select()
        .single()

      if (updateError) throw updateError
      
      companyId = existingPreview.id
      finalSlug = existingPreview.company_slug

      // Delete old services and testimonials to replace with new industry-specific ones
      await supabase.from('junk_services').delete().eq('company_id', companyId)
      await supabase.from('junk_testimonials').delete().eq('company_id', companyId)

    } else {
      // Create new preview company
      const { data: newCompany, error: insertError } = await supabase
        .from('junk_companies')
        .insert({
          company_slug: companySlug,
          company_name: businessName,
          industry,
          email,
          phone,
          city,
          state,
          service_radius: serviceRadius,
          logo_url: logoPreview,  // base64 from onboarding
          logo_background_color: logoBackgroundColor,
          primary_color: primaryColor || '#3B82F6',
          tagline,
          status: 'preview',
          plan: 'starter'
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      companyId = newCompany.id
      finalSlug = companySlug
    }

    // Create industry-specific services
    const services = industryServices[industry] || industryServices['default']
    const serviceInserts = services.map((service, index) => ({
      company_id: companyId,
      service_name: service.service_name,
      service_slug: service.service_slug,
      description: service.description,
      base_price: service.base_price,
      features: service.features,
      is_active: true,
      display_order: index + 1
    }))

    const { error: servicesError } = await supabase
      .from('junk_services')
      .insert(serviceInserts)

    if (servicesError) {
      console.error('Error creating services:', servicesError)
      // Don't fail the whole request, services are optional
    }

    // Create sample testimonials
    const testimonialInserts = sampleTestimonials.map((testimonial, index) => ({
      company_id: companyId,
      customer_name: testimonial.customer_name,
      rating: testimonial.rating,
      review_text: testimonial.review_text,
      service_type: testimonial.service_type,
      is_featured: testimonial.is_featured,
      is_active: true,
      display_order: index + 1
    }))

    const { error: testimonialsError } = await supabase
      .from('junk_testimonials')
      .insert(testimonialInserts)

    if (testimonialsError) {
      console.error('Error creating testimonials:', testimonialsError)
      // Don't fail the whole request, testimonials are optional
    }

    // Build preview URL
    const previewUrl = process.env.NODE_ENV === 'development'
      ? `http://localhost:3001?slug=${finalSlug}`
      : `https://service-business-platform.vercel.app?slug=${finalSlug}`

    return Response.json({
      success: true,
      companySlug: finalSlug,
      siteId: companyId,
      previewUrl,
      servicesCreated: serviceInserts.length,
      testimonialsCreated: testimonialInserts.length
    })

  } catch (error) {
    console.error('Preview creation error:', error)
    return Response.json(
      { error: error.message || 'Failed to create preview' },
      { status: 500 }
    )
  }
}