'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useState } from 'react'

const TABS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Unfulfilled', value: 'UNFULFILLED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Returns', value: 'RETURNS' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentQ = searchParams.get('q') || ''

  const [search, setSearch] = useState(currentQ)

  const updateFilters = (status: string, q: string) => {
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    if (q) params.set('q', q)
    router.push(`/2010admin/orders?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 sm:pb-0 hide-scrollbar w-full sm:w-auto">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => updateFilters(tab.value, search)}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentStatus === tab.value 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2 w-full sm:w-72 relative">
          <Input 
            placeholder="Search Order #..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateFilters(currentStatus, search)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <Button variant="secondary" onClick={() => updateFilters(currentStatus, search)}>Search</Button>
        </div>
      </div>
    </div>
  )
}
