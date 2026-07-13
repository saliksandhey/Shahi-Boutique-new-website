import { Metadata } from 'next'
import { ServicesHero } from '@/components/storefront/services/ServicesHero'
import { ServicesEditorial } from '@/components/storefront/services/ServicesEditorial'

export const metadata: Metadata = {
  title: 'Our Premium Services | Shahi Boutique',
  description: 'From custom stitching to premium handwork, we create outfits with precision, elegance, and attention to every detail.',
}

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ServicesHero />
      <ServicesEditorial />
    </div>
  )
}
