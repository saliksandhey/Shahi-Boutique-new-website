import { Metadata } from 'next'
import { getPublicBlogs } from '@/lib/actions/blog'
import { BlogClient } from './BlogClient'
import { Newsletter } from '@/components/storefront/Newsletter'

export const metadata: Metadata = {
  title: 'Shahi Feed | The Official Media Journal',
  description: 'Discover the latest fashion trends, boutique updates, styling inspiration, and behind-the-scenes moments from Shahi Boutique.',
  openGraph: {
    title: 'Shahi Feed | The Official Media Journal',
    description: 'Discover the latest fashion trends, boutique updates, styling inspiration, and behind-the-scenes moments from Shahi Boutique.',
    type: 'website',
  }
}

export default async function BlogPage() {
  // Fetch all published blogs
  const { data: blogs } = await getPublicBlogs()
  
  return (
    <main className="bg-[#F8F9FA] min-h-screen pt-32 pb-24">
      {/* Blog Client handles all the interactivity, filtering, animations and grid layout */}
      <BlogClient initialBlogs={blogs || []} />
      
      {/* Newsletter Section */}
      <div className="mt-32">
        <Newsletter />
      </div>
    </main>
  )
}
