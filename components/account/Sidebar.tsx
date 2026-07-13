'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Package, Heart, LogOut, MapPin, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signout } from '@/lib/actions/auth'

const navigation = [
  { name: 'Dashboard', href: '/account', icon: Home },
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Orders', href: '/account/orders', icon: Package },
  { name: 'Enquiries', href: '/account/enquiries', icon: MessageSquare },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="lg:sticky lg:top-32 space-y-2">
      <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center shrink-0 px-4 py-4 transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "text-[#111111]" 
                  : "text-gray-500 hover:text-[#111111]"
              )}
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 bg-[#111111] transition-transform duration-300 hidden lg:block",
                isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
              )} />
              
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 bg-[#111111] transition-transform duration-300 lg:hidden",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )} />

              <item.icon
                className={cn(
                  "mr-3 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-[#111111]" : "text-gray-400 group-hover:text-[#111111]"
                )}
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          )
        })}
        
        <form action={signout} className="shrink-0 mt-4 lg:mt-8">
          <button
            type="submit"
            className="w-full flex items-center px-4 py-4 text-gray-500 hover:text-red-600 transition-colors duration-300 group"
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-600 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </form>
      </nav>
    </div>
  )
}
