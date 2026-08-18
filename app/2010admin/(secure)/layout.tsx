import { checkAdmin } from '@/lib/auth'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'
import { MobileNav } from '@/components/admin/MobileNav'
import { AdminLogin } from '@/components/admin/AdminLogin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkAdmin()

  if (!isAdmin) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] selection:bg-[#FF7A00] selection:text-white font-sans">
      <Sidebar />
      <div className="lg:pl-72 pb-28 lg:pb-0">
        <Header />
        <main className="py-6 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
