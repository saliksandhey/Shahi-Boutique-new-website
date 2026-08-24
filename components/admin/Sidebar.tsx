'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { adminLogout } from '@/lib/actions/admin-auth'
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Image as ImageIcon, 
  Star, 
  Settings,
  ArrowLeft,
  Megaphone,
  MessageSquare,
  PenTool,
  LogOut,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/2010admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/2010admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/2010admin/products', icon: Package },
  { name: 'Customers', href: '/2010admin/customers', icon: Users },
  { name: 'Payments', href: '/2010admin/payments', icon: Ticket },
  { name: 'Categories', href: '/2010admin/categories', icon: Tags },
  { name: 'Coupons', href: '/2010admin/coupons', icon: Ticket },
  { name: 'Reviews', href: '/2010admin/reviews', icon: Star },
  { name: 'Appointments', href: '/2010admin/appointments', icon: Calendar },
  { name: 'Enquiries', href: '/2010admin/enquiries', icon: MessageSquare },
  { name: 'Product Enquiries', href: '/2010admin/product-enquiries', icon: MessageSquare },
  { name: 'Feed', href: '/2010admin/blogs', icon: PenTool },
  { name: 'Announcements', href: '/2010admin/announcements', icon: Megaphone },
  { name: 'Banners', href: '/2010admin/banners', icon: ImageIcon },
]

export function Sidebar({ newOrdersCount = 0 }: { newOrdersCount?: number }) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNavigation = navigation.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col overflow-y-auto bg-[#111111] text-gray-400 px-4 pb-4 shadow-2xl">
        <div className="flex h-24 shrink-0 items-center justify-center mb-6 px-2 border-b border-white/5">
          <Link href="/2010admin" className="relative w-40 h-10 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="SHAHI" 
              fill 
              className="object-contain object-center invert brightness-0"
              quality={100}
              priority
            />
          </Link>
        </div>
        <div className="px-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00] transition-all"
            />
          </div>
        </div>
        <nav className="flex flex-1 flex-col custom-scrollbar overflow-y-auto pr-2">
          {filteredNavigation.length > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-3">
              Management
            </div>
          )}
          <ul role="list" className="flex flex-1 flex-col gap-y-2 mb-8">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/2010admin' && pathname.startsWith(item.href + '/'))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-white/10 text-white font-semibold shadow-inner'
                        : 'hover:text-white hover:bg-white/5 font-medium',
                      'group flex items-center gap-x-4 rounded-xl px-4 py-3 text-sm transition-all duration-300 ease-in-out'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-[#FF7A00]' : 'text-gray-500 group-hover:text-white',
                        'h-5 w-5 shrink-0 transition-colors duration-300'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.name === 'Orders' && newOrdersCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {newOrdersCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-3">
            System
          </div>
          <ul role="list" className="flex flex-col gap-y-2">
             <li>
                <Link
                  href="/2010admin/settings"
                  className={cn(
                    pathname.startsWith('/2010admin/settings')
                      ? 'bg-white/10 text-white font-semibold'
                      : 'hover:text-white hover:bg-white/5 font-medium',
                    'group flex items-center gap-x-4 rounded-xl px-4 py-3 text-sm transition-all duration-300'
                  )}
                >
                  <Settings
                    className={cn(
                      pathname.startsWith('/2010admin/settings') ? 'text-[#FF7A00]' : 'text-gray-500 group-hover:text-white',
                      'h-5 w-5 shrink-0 transition-colors'
                    )}
                  />
                  Settings
                </Link>
              </li>
          </ul>
        </nav>
        
        <div className="mt-8 space-y-2 pt-6 border-t border-white/5">
          <Link
            href="/"
            className="group flex items-center gap-x-4 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft
              className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-white transition-colors"
              aria-hidden="true"
            />
            Storefront
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full group flex items-center gap-x-4 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-300"
            >
              <LogOut className="h-5 w-5 shrink-0 text-red-500/70 group-hover:text-red-400" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
      
      {/* Custom scrollbar styles for webkit */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.1);
          border-radius: 20px;
        }
      `}} />
    </div>
  )
}

