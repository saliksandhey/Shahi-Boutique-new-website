import { getStoreSettings } from '@/lib/actions/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 lg:pb-12">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Settings</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">Manage store configuration and preferences.</p>
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
