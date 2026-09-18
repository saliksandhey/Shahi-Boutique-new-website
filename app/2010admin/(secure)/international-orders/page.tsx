import { getInternationalOrders } from '@/lib/actions/international-orders'
import { AdminInternationalOrdersManager } from '@/components/admin/AdminInternationalOrdersManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'International Orders & Concierge | Shahi Admin',
  description: 'Manage and quote international bespoke orders and inquiries.'
}

export default async function InternationalOrdersAdminPage() {
  const { orders = [] } = await getInternationalOrders()

  return (
    <div className="max-w-7xl mx-auto">
      <AdminInternationalOrdersManager initialOrders={orders || []} />
    </div>
  )
}
