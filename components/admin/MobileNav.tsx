'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Menu,
  X,
  Tags, 
  Ticket, 
  Star, 
  Megaphone, 
  Settings, 
  Calendar, 
  MessageSquare, 
  PenTool, 
  Image as ImageIcon 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mainTabs = [
  { name: 'Dashboard', href: '/2010admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/2010admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/2010admin/products', icon: Package },
]

const moreTabs = [
  { name: 'Customers', href: '/2010admin/customers', icon: Users },
  { name: 'Categories', href: '/2010admin/categories', icon: Tags },
  { name: 'Appointments', href: '/2010admin/appointments', icon: Calendar },
  { name: 'Enquiries', href: '/2010admin/enquiries', icon: MessageSquare },
  { name: 'Product Enquiries', href: '/2010admin/product-enquiries', icon: MessageSquare },
  { name: 'Feed', href: '/2010admin/blogs', icon: PenTool },
  { name: 'Coupons', href: '/2010admin/coupons', icon: Ticket },
  { name: 'Reviews', href: '/2010admin/reviews', icon: Star },
  { name: 'Announcements', href: '/2010admin/announcements', icon: Megaphone },
  { name: 'Banners', href: '/2010admin/banners', icon: ImageIcon },
  { name: 'Settings', href: '/2010admin/settings', icon: Settings },
]

export function MobileNav({ newOrdersCount = 0 }: { newOrdersCount?: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Glassmorphic Bottom Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] w-[90%] max-w-sm bg-[#111111]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-2 py-3 transition-all duration-300">
        <div className="flex items-center justify-around h-full">
          {mainTabs.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/2010admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center w-full space-y-1 relative group"
              >
                <div className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors", 
                    isActive ? "text-[#FF7A00]" : "text-gray-400 group-hover:text-white"
                  )} />
                </div>
              </Link>
            )
          })}

          {/* More Menu Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center w-full space-y-1 relative group outline-none"
          >
            <div className="p-2 rounded-full transition-all duration-300 hover:bg-white/5">
              <Menu className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Full-Screen Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#FAFAFA] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <h2 className="text-2xl font-serif font-black tracking-widest uppercase text-gray-900">
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
              <div className="grid grid-cols-2 gap-4">
                {moreTabs.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border bg-white shadow-sm transition-all duration-300",
                        pathname.startsWith(item.href)
                          ? "border-[#FF7A00] bg-[#FF7A00]/5 text-[#FF7A00]"
                          : "border-gray-100 hover:border-gray-300 text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

