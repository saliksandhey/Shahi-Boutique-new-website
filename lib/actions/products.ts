'use server'

import { createPublicClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export async function getUpsellProducts() {
  noStore()
  const supabase = createPublicClient()
  
  // Get active in-stock products only
  const { data } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary)')
    .eq('status', 'ACTIVE')
    .or('stock.gt.0,stock.is.null')
    .limit(50)
    
  if (!data) return []
  
  // Extra filter to be 100% sure no out-of-stock items pass through
  const available = data.filter((p: any) => p.status === 'ACTIVE' && (p.stock === null || p.stock === undefined || p.stock > 0))
  
  // Shuffle array to return random products
  return available.sort(() => 0.5 - Math.random())
}
