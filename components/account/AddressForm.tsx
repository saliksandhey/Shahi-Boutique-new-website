'use client'

import { useState } from 'react'
import { saveAddress, deleteAddress } from '@/lib/actions/address'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

export function AddressForm({ address = null, onComplete }: { address?: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    if (address?.id) formData.append('id', address.id)

    const res = await saveAddress(formData)
    
    if (res.success) {
      onComplete()
    } else {
      setError(res.error || 'Something went wrong.')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!address?.id) return
    if (!confirm('Are you sure you want to delete this address?')) return
    
    setLoading(true)
    const res = await deleteAddress(address.id)
    if (res.success) {
      onComplete()
    } else {
      setError(res.error || 'Failed to delete address.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="uppercase tracking-widest text-[10px] font-bold text-gray-500">Full Name</Label>
          <Input name="full_name" defaultValue={address?.full_name || ''} required className="rounded-none border-gray-200 mt-2" />
        </div>
        <div>
          <Label className="uppercase tracking-widest text-[10px] font-bold text-gray-500">Phone</Label>
          <Input name="phone" defaultValue={address?.phone || ''} required className="rounded-none border-gray-200 mt-2" />
        </div>
      </div>

      <div>
        <Label className="uppercase tracking-widest text-[10px] font-bold text-gray-500">Street Address</Label>
        <Input name="address_line1" defaultValue={address?.address_line1 || ''} required className="rounded-none border-gray-200 mt-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label className="uppercase tracking-widest text-[10px] font-bold text-gray-500">City</Label>
          <Input name="city" defaultValue={address?.city || ''} required className="rounded-none border-gray-200 mt-2" />
        </div>
        <div>
          <Label className="uppercase tracking-widest text-[10px] font-bold text-gray-500">State</Label>
          <Input name="state" defaultValue={address?.state || ''} required className="rounded-none border-gray-200 mt-2" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <Label className="uppercase tracking-widest text-[10px] font-bold text-gray-500">PIN Code</Label>
          <Input name="postal_code" defaultValue={address?.postal_code || ''} required className="rounded-none border-gray-200 mt-2" />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      )}

      <div className="flex items-center justify-between pt-4">
        {address?.id ? (
          <button type="button" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-700 p-2">
            <Trash2 className="w-5 h-5" />
          </button>
        ) : <div />}
        
        <div className="flex items-center gap-4">
          <button type="button" onClick={onComplete} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <Button type="submit" disabled={loading} className="bg-[#111111] text-white rounded-none px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 h-auto">
            {loading ? 'Saving...' : 'Save Address'}
          </Button>
        </div>
      </div>
    </form>
  )
}
