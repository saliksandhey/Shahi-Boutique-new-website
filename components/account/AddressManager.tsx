'use client'

import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import { AddressForm } from '@/components/account/AddressForm'

export function AddressManager({ initialAddresses }: { initialAddresses: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">Saved Addresses</h2>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#111111] transition-colors flex items-center group"
          >
            <Plus className="w-3 h-3 mr-1" /> Add New
          </button>
        )}
      </div>

      {isAdding && (
        <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50/50 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Add New Address</h3>
          <AddressForm onComplete={() => setIsAdding(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialAddresses.map(address => (
          editingId === address.id ? (
            <div key={address.id} className="border border-[#111111] p-6 rounded-2xl col-span-1 md:col-span-2 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Edit Address</h3>
              <AddressForm address={address} onComplete={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={address.id} className="group border border-gray-100 hover:border-[#111111] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#111111] transition-colors" />
                  <span className="text-sm font-black tracking-wide text-gray-900">{address.full_name}</span>
                </div>
                <div className="text-sm text-gray-500 font-medium space-y-1">
                  <p>{address.address_line1}</p>
                  <p>{address.city}, {address.state} {address.postal_code}</p>
                  <p>{address.phone}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setEditingId(address.id)}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#111111] transition-colors"
                >
                  Edit Address
                </button>
              </div>
            </div>
          )
        ))}
      </div>

      {initialAddresses.length === 0 && !isAdding && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <MapPin className="mx-auto h-8 w-8 text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">No addresses found</h3>
          <p className="text-xs text-gray-500 font-medium mb-6">Save your addresses for faster checkout.</p>
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center rounded-full bg-[#111111] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-gray-800 transition-colors"
          >
            Add New Address
          </button>
        </div>
      )}
    </div>
  )
}
