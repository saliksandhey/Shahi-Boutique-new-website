'use client'

import { LogOut, User, ChevronRight } from 'lucide-react'
import { adminLogout } from '@/lib/actions/admin-auth'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white/70 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 border-b border-gray-200">
      
      {/* Mobile Title */}
      <div className="lg:hidden flex items-center">
        <Link href="/2010admin" className="relative w-28 h-8 flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="SHAHI" 
            fill 
            className="object-contain object-left"
            quality={100}
            priority
          />
        </Link>
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join('/')}`
          const isLast = index === paths.length - 1
          const title = path.charAt(0).toUpperCase() + path.slice(1)
          
          return (
            <div key={path} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <Link 
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isLast ? 'text-[#09090B]' : 'text-gray-500 hover:text-[#09090B]'
                }`}
              >
                {title}
              </Link>
            </div>
          )
        })}
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-4">
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-medium leading-6 text-gray-700" aria-hidden="true">
                Administrator
              </span>
            </span>
            <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            
            <form action={adminLogout}>
              <Button variant="ghost" size="icon" type="submit" title="Logout" className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
