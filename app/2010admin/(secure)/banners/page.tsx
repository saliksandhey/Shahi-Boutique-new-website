import { getStoreSettings } from '@/lib/actions/settings'
import { BannerSettingsForm } from '@/components/admin/BannerSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminBannersPage() {
  const initialSettings = await getStoreSettings()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase mb-2">BANNERS</h1>
        <p className="text-sm font-medium text-gray-500">
          Manage your home page slider and promotional banners.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <BannerSettingsForm initialSettings={initialSettings} />
      </div>
    </div>
  )
}
