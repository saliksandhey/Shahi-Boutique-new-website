import { createPublicClient } from '@/lib/supabase/server'
import { getStoreSettings } from '@/lib/actions/settings'
import { HeroLuxury } from '@/components/storefront/HeroLuxury'
import { CurrencyDropdown } from '@/components/storefront/CurrencyDropdown'
import { ServicesSection } from '@/components/storefront/ServicesSection'
import { CollectionSlider } from '@/components/storefront/CollectionSlider'
import { HomeFeedSection } from '@/components/storefront/HomeFeedSection'
import { WhyChooseUs } from '@/components/storefront/WhyChooseUs'
import { WorldwideDelivery } from '@/components/storefront/WorldwideDelivery'
import { CustomerReviews } from '@/components/storefront/CustomerReviews'
import { AppointmentBanner } from '@/components/storefront/AppointmentBanner'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createPublicClient()
  const settings = await getStoreSettings()
  const heroBannerUrl = settings?.hero_banner_image
  const heroBannerMobileUrl = settings?.hero_banner_mobile_image
  const marqueeContent = settings?.marquee_content
  const marqueeSpeed = settings?.marquee_speed
  
  let heroSlides = []
  try {
    heroSlides = JSON.parse(settings?.hero_slider_slides || '[]')
  } catch (e) {
    heroSlides = []
  }
  const heroInterval = parseInt(settings?.hero_slider_interval || '5', 10)

  // Fetch All Active & Out of Stock Products for New Arrivals
  const { data: recentProducts } = await supabase.from('products')
    .select('*, product_images(url, is_primary), categories(name)')
    .in('status', ['ACTIVE', 'OUT_OF_STOCK'])
    .order('created_at', { ascending: false })

  const newArrivals = recentProducts || []

  // Fetch Latest Feed Posts
  const { data: recentBlogs } = await supabase.from('blogs')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(8)

  // Fetch Featured Reviews for Homepage
  const { data: featuredReviews } = await supabase.from('reviews')
    .select('*, products(name, product_images(url))')
    .eq('approved', true)
    .eq('is_featured_home', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col w-full">

      {/* Section 3: Hero Section */}
      <HeroLuxury 
        heroBannerUrl={heroBannerUrl} 
        heroBannerMobileUrl={heroBannerMobileUrl} 
        marqueeContent={marqueeContent}
        marqueeSpeed={marqueeSpeed}
        slides={heroSlides}
        intervalSecs={heroInterval}
      />

      {/* Services Section */}
      <ServicesSection />

      {/* Section 4: All Products / New Arrivals */}
      <CollectionSlider products={newArrivals} />

      {/* Section 4.5: Feed / Delivered Ensembles */}
      <HomeFeedSection blogs={recentBlogs || []} />

      {/* Section 5: Book Appointment Banner */}
      <AppointmentBanner />

      {/* Section 6: Why Choose Us */}
      <WhyChooseUs />

      {/* Section 7: Worldwide Delivery */}
      <WorldwideDelivery />

      {/* Section 8: Customer Reviews */}
      <CustomerReviews dbReviews={featuredReviews || []} />

    </div>
  )
}
