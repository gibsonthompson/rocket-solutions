// Run this with: node fix-logo.js
// Make sure you're in the rocket-solutions directory (needs the .env.local)

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need admin key for storage
)

const COMPANY_SLUG = 'bob-mkc1h42w-vi14ls'

async function fixLogo() {
  console.log('Fetching company data...')
  
  // Get the current base64 logo
  const { data: company, error: fetchError } = await supabase
    .from('junk_companies')
    .select('id, company_name, logo_url')
    .eq('company_slug', COMPANY_SLUG)
    .single()
  
  if (fetchError) {
    console.error('Error fetching company:', fetchError)
    return
  }
  
  console.log('Company:', company.company_name)
  
  const base64Data = company.logo_url
  
  if (!base64Data || !base64Data.startsWith('data:image/')) {
    console.log('Logo is not base64 or is empty. Current value:', base64Data?.substring(0, 50))
    return
  }
  
  console.log('Found base64 logo, uploading to storage...')
  
  // Parse the base64
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) {
    console.error('Could not parse base64 data')
    return
  }
  
  const imageType = matches[1]
  const base64String = matches[2]
  
  // Convert to buffer
  const buffer = Buffer.from(base64String, 'base64')
  console.log('Image size:', buffer.length, 'bytes')
  
  // Upload to storage
  const fileName = `logos/${COMPANY_SLUG}-logo-${Date.now()}.${imageType}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('company-assets')
    .upload(fileName, buffer, {
      contentType: `image/${imageType}`,
      upsert: true
    })
  
  if (uploadError) {
    console.error('Upload error:', uploadError)
    return
  }
  
  console.log('Uploaded successfully!')
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('company-assets')
    .getPublicUrl(fileName)
  
  const publicUrl = urlData.publicUrl
  console.log('Public URL:', publicUrl)
  
  // Update database
  const { error: updateError } = await supabase
    .from('junk_companies')
    .update({ logo_url: publicUrl })
    .eq('company_slug', COMPANY_SLUG)
  
  if (updateError) {
    console.error('Update error:', updateError)
    return
  }
  
  console.log('✅ Database updated! Logo is now hosted properly.')
}

fixLogo()
