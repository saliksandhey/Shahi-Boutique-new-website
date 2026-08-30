'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { SearchDrawer } from './SearchDrawer'
import { FloatingAppointmentButton } from './FloatingAppointmentButton'
import { CurrencyDropdown } from './CurrencyDropdown'

export function StorefrontWrapper({ children, categories }: { children: React.ReactNode, categories: any[] }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/2010admin')
  const isHomepage = pathname === '/'

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar categories={categories} />
      <CartDrawer />
      <SearchDrawer />
      <FloatingAppointmentButton />
      {<div className={`md:hidden fixed ${(pathname === '/shop' || pathname.startsWith('/product')) ? 'bottom-28 lg:bottom-4' : 'bottom-4'} left-4 z-[90] bg-white rounded-md shadow-lg border border-gray-100 px-2 py-1 flex items-center justify-center transition-all duration-300`}>
          <CurrencyDropdown upwards alignLeft />
        </div>}
      <main className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
    </div>
  )
}
