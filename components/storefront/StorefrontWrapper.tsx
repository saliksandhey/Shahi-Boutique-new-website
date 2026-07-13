'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnnouncementBar } from './AnnouncementBar'
import { CartDrawer } from './CartDrawer'
import { SearchDrawer } from './SearchDrawer'

export function StorefrontWrapper({ children, categories }: { children: React.ReactNode, categories: any[] }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
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
      <main className={`flex-1 ${!isHomepage ? 'pt-[112px]' : ''}`}>
        {children}
      </main>
      <Footer categories={categories} />
    </div>
  )
}
