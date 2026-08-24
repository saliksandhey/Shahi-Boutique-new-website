import { requireAuth, getCurrentProfile } from '@/lib/auth'
import { Sidebar } from '@/components/account/Sidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  const profile = await getCurrentProfile()

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-32 pt-16 md:pt-24">
      {/* Premium Header */}
      <div className="bg-[#F8F9FA] py-10 md:py-20 px-4 text-center mb-6 md:mb-16 border-b border-gray-100 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-sm">
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#FF7A00] font-bold mb-3 block">
          Welcome back
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-2 leading-none">
          {profile?.full_name?.split(' ')[0] || 'My Account'}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 font-medium mt-3">
          {user.email}
        </p>
      </div>

      <div className="mx-auto max-w-7xl lg:px-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">
          <div className="hidden lg:block w-full lg:w-64 shrink-0 px-4 sm:px-8 lg:px-0">
            <Sidebar />
          </div>
          <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
