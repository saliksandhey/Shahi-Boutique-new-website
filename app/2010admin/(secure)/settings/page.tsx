import { getStoreSettings } from '@/lib/actions/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'
import Link from 'next/link'
import { Truck } from 'lucide-react'

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Settings</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">Manage store configuration and preferences.</p>
        </div>
        <Link 
          href="/2010admin/settings/shipping"
          className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-900 transition-colors"
        >
          <Truck className="w-5 h-5" />
          Manage Shipping Rates
        </Link>
      </div>
      
      <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100">
        <SettingsForm 
          key={JSON.stringify(settings)}
          initialSettings={settings} 
        />
      </div>
    </div>
  )
}
