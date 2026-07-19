import { requireAuth, getCurrentProfile } from '@/lib/auth'
import { Sidebar } from '@/components/account/Sidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  const profile = await getCurrentProfile()

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-32">
      <div className="bg-[#F8F9FA] py-6 md:py-16 px-4 text-center mb-6 md:mb-16 border-b border-gray-100">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-1 md:mb-4 leading-none">
          MY ACCOUNT
        </h1>
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'Guest'}</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="w-full lg:w-64 shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
