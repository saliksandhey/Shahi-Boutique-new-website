'use server'

import { createPublicClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

export async function getUpsellProducts() {
  noStore()
  const supabase = createPublicClient()
  
  // Get active products
  const { data } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary)')
    .eq('status', 'ACTIVE')
    .limit(50)
    
  if (!data) return []
  
  // Shuffle array to return random products
  return data.sort(() => 0.5 - Math.random())
}
