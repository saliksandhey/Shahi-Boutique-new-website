import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shahiboutique.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/2010admin/', '/account/', '/checkout/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
