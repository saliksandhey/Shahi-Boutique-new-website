'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  PenTool
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { name: 'Feed', href: '/admin/blogs', icon: PenTool },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col overflow-y-auto border-r border-gray-200 bg-white px-4 pb-4">
        <div className="flex h-16 shrink-0 items-center mb-4 px-2">
          <Link href="/admin" className="text-xl font-heading font-black tracking-widest text-[#09090B] hover:opacity-70 transition-opacity">
            SHAHI
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gray-100 text-[#09090B] font-semibold'
                            : 'text-gray-500 hover:text-[#09090B] hover:bg-gray-50 font-medium',
                          'group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm transition-colors'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-[#09090B]' : 'text-gray-400 group-hover:text-[#09090B]',
                            'h-4 w-4 shrink-0 transition-colors'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto pb-2 space-y-1 pt-4 border-t border-gray-100">
          <Link
            href="/"
            className="group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-[#09090B] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft
              className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-[#09090B] transition-colors"
              aria-hidden="true"
            />
            Back to Store
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
