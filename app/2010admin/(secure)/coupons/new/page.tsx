import { CouponForm } from '@/components/admin/CouponForm'

export default function NewCouponPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Coupon</h1>
      </div>
      <CouponForm />
    </div>
  )
}
