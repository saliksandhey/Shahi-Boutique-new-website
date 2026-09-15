'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function PaymentsClient({ currentFilter }: { currentFilter: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', status)
    router.push(`?${params.toString()}`)
  }

  const filters = [
    { label: 'All Transactions', value: 'ALL' },
    { label: 'Paid / Completed', value: 'PAID' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Failed', value: 'FAILED' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <Badge
          key={f.value}
          variant={currentFilter === f.value ? 'default' : 'outline'}
          className={`cursor-pointer text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${
            currentFilter === f.value 
              ? 'bg-[#1C1C1C] text-white shadow-sm' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
          }`}
          onClick={() => setFilter(f.value)}
        >
          {f.label}
        </Badge>
      ))}
    </div>
  )
}
