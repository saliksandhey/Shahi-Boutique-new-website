import { createPublicClient } from '@/lib/supabase/server'
import { getStoreSettings } from '@/lib/actions/settings'
import { HeroLuxury } from '@/components/storefront/HeroLuxury'
import { ServicesSection } from '@/components/storefront/ServicesSection'
import { CollectionSlider } from '@/components/storefront/CollectionSlider'
import { HomeFeedSection } from '@/components/storefront/HomeFeedSection'
import { WhyChooseUs } from '@/components/storefront/WhyChooseUs'
import { WorldwideDelivery } from '@/components/storefront/WorldwideDelivery'
import { CustomerReviews } from '@/components/storefront/CustomerReviews'
import { Newsletter } from '@/components/storefront/Newsletter'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createPublicClient()
  const settings = await getStoreSettings()
  const heroBannerUrl = settings?.hero_banner_image
  const heroBannerMobileUrl = settings?.hero_banner_mobile_image
  const marqueeContent = settings?.marquee_content
  const marqueeSpeed = settings?.marquee_speed

  // Fetch All Active Products for New Arrivals
  const { data: recentProducts } = await supabase.from('products')
    .select('*, product_images(url, is_primary), categories(name)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  const newArrivals = recentProducts || []

  // Fetch Latest Feed Posts
  const { data: recentBlogs } = await supabase.from('blogs')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(8)

  return (
    <div className="flex flex-col w-full">
      
      {/* Section 3: Hero Section */}
      <HeroLuxury 
        heroBannerUrl={heroBannerUrl} 
        heroBannerMobileUrl={heroBannerMobileUrl} 
        marqueeContent={marqueeContent}
        marqueeSpeed={marqueeSpeed}
      />

      {/* Services Section */}
      <ServicesSection />

      {/* Section 4: All Products / New Arrivals */}
      <CollectionSlider products={newArrivals} />

      {/* Section 4.5: Feed */}
      <HomeFeedSection blogs={recentBlogs || []} />

      {/* Section 5: Why Choose Us */}
      <WhyChooseUs />

      {/* Section 6: Worldwide Delivery */}
      <WorldwideDelivery />

      {/* Section 7: Customer Reviews */}
      <CustomerReviews />

      {/* Section 8: Newsletter */}
      <Newsletter />
      
      {/* Section 10: Footer is in layout.tsx */}
    </div>
  )
}
