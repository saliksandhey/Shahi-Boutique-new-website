'use client'

import { useState } from 'react'
import { markOrderAsPaid } from '@/lib/actions/payments'
import { CheckCircle } from 'lucide-react'
export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)

  const handleMarkPaid = async () => {
    if (confirm('Are you sure you want to mark this order as PAID?')) {
      setLoading(true)
      const res = await markOrderAsPaid(orderId)
      if (res.success) {
        alert('Order marked as Paid')
      } else {
        alert(res.error || 'Failed to mark as paid')
      }
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleMarkPaid}
      disabled={loading}
      className="inline-flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors w-8 h-8 rounded-full disabled:opacity-50" 
      title="Mark as Paid"
    >
      <CheckCircle className="w-4 h-4" />
    </button>
  )
}
