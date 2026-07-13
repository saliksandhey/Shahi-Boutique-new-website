'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tags, Ticket, Star, Megaphone, Settings, Calendar, MessageSquare, PenTool } from 'lucide-react'

const mainTabs = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
]

const moreTabs = [
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { name: 'Feed', href: '/admin/blogs', icon: PenTool },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  const router = useRouter()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        {mainTabs.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-[#1C1C1C]" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-gray-100")} />
              <span className="text-[9px] font-black tracking-widest uppercase">{item.name}</span>
            </Link>
          )
        })}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-gray-900 outline-none">
            <Menu className="w-6 h-6" />
            <span className="text-[9px] font-black tracking-widest uppercase">More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/categories" className="flex items-center w-full px-2 py-1.5">
                <Tags className="w-4 h-4 mr-2" /> Categories
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/appointments" className="flex items-center w-full px-2 py-1.5">
                <Calendar className="w-4 h-4 mr-2" /> Appointments
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/enquiries" className="flex items-center w-full px-2 py-1.5">
                <MessageSquare className="w-4 h-4 mr-2" /> Enquiries
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/coupons" className="flex items-center w-full px-2 py-1.5">
                <Ticket className="w-4 h-4 mr-2" /> Coupons
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/reviews" className="flex items-center w-full px-2 py-1.5">
                <Star className="w-4 h-4 mr-2" /> Reviews
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/announcements" className="flex items-center w-full px-2 py-1.5">
                <Megaphone className="w-4 h-4 mr-2" /> Announcements
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0 cursor-pointer">
              <Link href="/admin/settings" className="flex items-center w-full px-2 py-1.5">
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
