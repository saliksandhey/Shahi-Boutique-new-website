import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { AddressManager } from '@/components/account/AddressManager'
import { MobileBackNav } from '@/components/account/MobileBackNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Addresses | SHAHI',
  description: 'Manage your shipping and billing addresses.',
}

export default async function AddressesPage() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <MobileBackNav />
      <AddressManager initialAddresses={addresses || []} />
    </div>
  )
}
