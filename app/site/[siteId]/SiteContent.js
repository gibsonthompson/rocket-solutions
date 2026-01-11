'use client'
import SiteTemplate from '../../components/SiteTemplate'

export default function SiteContent({ siteData }) {
  return (
    <SiteTemplate 
      siteData={siteData}
      isPreview={false}
      showTimer={false}
    />
  )
}