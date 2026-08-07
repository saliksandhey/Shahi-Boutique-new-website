import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function MobileBackNav() {
  return (
    <div className="lg:hidden mb-6 -mt-4">
      <Link href="/account" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#111111] transition-colors group">
        <ChevronLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Account
      </Link>
    </div>
  )
}
