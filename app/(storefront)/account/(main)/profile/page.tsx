import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('name, phone')
    .eq('email', user.email)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-8">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-[#111111] mb-2">Profile Details</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Manage your personal information.
        </p>
      </div>

      <ProfileForm 
        initialName={profile?.name || ''} 
        initialPhone={profile?.phone || ''} 
        email={user.email} 
      />
    </div>
  )
}
