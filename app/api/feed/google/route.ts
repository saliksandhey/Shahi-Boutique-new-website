import { createPublicClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // refresh every hour

export async function GET() {
  const supabase = createPublicClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shahiboutique.com'

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary), categories(name)')
    .in('status', ['ACTIVE', 'OUT_OF_STOCK'])
    .order('created_at', { ascending: false })

  if (!products) {
    return new NextResponse('No products found', { status: 404 })
  }

  const items = products.map((p: any) => {
    const images: any[] = p.product_images || []
    const sorted = [...images].sort((a, b) => (a.position || 0) - (b.position || 0))
    const primaryImage = sorted.find((i: any) => i.is_primary)?.url || sorted[0]?.url || ''
    const additionalImages = sorted.slice(1, 10).map((i: any) => i.url).filter(Boolean)

    const isOutOfStock = p.status === 'OUT_OF_STOCK' || (typeof p.stock === 'number' && p.stock <= 0)
    const price = p.price_inr ?? p.price ?? 0
    const salePrice = p.sale_price_inr ?? p.sale_price ?? null

    const productUrl = `${siteUrl}/product/${p.slug}`
    const title = `${p.name}${p.fabric ? ` - ${p.fabric}` : ''}`
    const description = (p.meta_description || p.description || `Buy ${p.name} at Shahi Boutique`).substring(0, 5000)

    return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${primaryImage}</g:image_link>
      ${additionalImages.map(url => `<g:additional_image_link>${url}</g:additional_image_link>`).join('\n      ')}
      <g:availability>${isOutOfStock ? 'out_of_stock' : 'in_stock'}</g:availability>
      <g:price>${price.toFixed(2)} INR</g:price>
      ${salePrice && salePrice > 0 ? `<g:sale_price>${salePrice.toFixed(2)} INR</g:sale_price>` : ''}
      <g:brand>Shahi Boutique</g:brand>
      <g:condition>new</g:condition>
      ${p.sku ? `<g:mpn>${p.sku}</g:mpn>` : `<g:identifier_exists>no</g:identifier_exists>`}
      ${p.categories?.name ? `<g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
      <g:product_type><![CDATA[${p.categories.name}]]></g:product_type>` : '<g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>'}
      ${p.material ? `<g:material><![CDATA[${p.material}]]></g:material>` : ''}
      ${p.fabric ? `<g:pattern><![CDATA[${p.fabric}]]></g:pattern>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>0 INR</g:price>
      </g:shipping>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Shahi Boutique — Product Feed</title>
    <link>${siteUrl}</link>
    <description>Luxury boutique clothing and fashion from Shahi Boutique</description>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
    },
  })
}
