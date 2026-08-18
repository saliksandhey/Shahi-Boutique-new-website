import { createAdminClient } from '@/lib/supabase/server'
import { CouponForm } from '@/components/admin/CouponForm'
import { notFound } from 'next/navigation'

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const id = await params.id;
  const supabase = createAdminClient()
  const { data: coupon } = await supabase.from('coupons').select('*').eq('id', id).single()

  if (!coupon) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Coupon</h1>
      </div>
      <CouponForm coupon={coupon} />
    </div>
  )
}
