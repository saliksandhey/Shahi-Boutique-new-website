import { createAdminClient } from '@/lib/supabase/server'
import { AdminReviewsManager } from '@/components/admin/AdminReviewsManager'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const supabase = createAdminClient()
  
  // Fetch all reviews with linked profile and product info
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, email), products(id, name)')
    .order('created_at', { ascending: false })

  // Fetch active products for the manual review creation dropdown
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .in('status', ['ACTIVE', 'OUT_OF_STOCK'])
    .order('name', { ascending: true })

  return (
    <AdminReviewsManager 
      initialReviews={reviews || []} 
      products={products || []} 
    />
  )
}


