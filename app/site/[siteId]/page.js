import { createClient } from '@supabase/supabase-js'
import SiteContent from './SiteContent'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function SitePage({ params }) {
  const { siteId } = params
  
  const { data, error } = await supabase
    .from('rocket_sites')
    .select('*')
    .eq('id', siteId)
    .single()

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Site Not Found</h1>
          <p className="text-gray-600">{error?.message || 'This site does not exist.'}</p>
        </div>
      </div>
    )
  }

  const siteData = {
    businessName: data.business_name,
    industry: data.industry,
    ownerName: data.owner_name,
    email: data.owner_email || data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    tagline: data.tagline || data.hero_subheadline,
    primaryColor: data.primary_color || '#3B82F6',
    logoPreview: data.logo_url,
    logoBackgroundColor: data.logo_background_color,
    serviceRadius: data.service_radius || '25',
    heroImage: data.hero_image_url || null,
    galleryImages: data.gallery_images || [],
    googleRating: data.google_rating || 5.0,
    googleReviewCount: data.google_review_count || 47,
    googleBusinessUrl: data.google_business_url,
    facebookUrl: data.facebook_url,
    instagramUrl: data.instagram_url,
    yelpUrl: data.yelp_url,
    twitterUrl: data.twitter_url,
    linkedinUrl: data.linkedin_url,
    tiktokUrl: data.tiktok_url,
    serviceAreas: data.service_areas || [],
    businessHours: data.business_hours,
  }

  return <SiteContent siteData={siteData} />
}