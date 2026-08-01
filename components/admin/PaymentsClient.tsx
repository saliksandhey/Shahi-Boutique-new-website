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
    { label: 'All Concierge', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((f) => (
        <Badge
          key={f.value}
          variant={currentFilter === f.value ? 'default' : 'outline'}
          className="cursor-pointer text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#1C1C1C] hover:text-white transition-colors"
          onClick={() => setFilter(f.value)}
        >
          {f.label}
        </Badge>
      ))}
    </div>
  )
}
