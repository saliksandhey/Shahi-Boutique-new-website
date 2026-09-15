'use client'

import { useState, useEffect, useTransition } from 'react'
import { saveProductGroup } from '@/lib/actions/product-groups'
import Image from 'next/image'
import { X, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  price_inr: number | null
  product_images: { url: string; is_primary: boolean; position: number }[]
}

interface GroupItem {
  product_id: string
  product: Product
  color_name: string
}

interface Props {
  allProducts: Product[]
  group?: {
    id: string
    name: string
    product_group_items: {
      product_id: string
      color_name: string
      products: Product
    }[]
  } | null
}

export function ProductGroupForm({ allProducts, group }: Props) {
  const [groupName, setGroupName] = useState(group?.name || '')
  const [items, setItems] = useState<GroupItem[]>(() =>
    group?.product_group_items?.map(i => ({
      product_id: i.product_id,
      product: i.products,
      color_name: i.color_name,
    })) || []
  )
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const addedIds = new Set(items.map(i => i.product_id))

  const filtered = allProducts.filter(
    p => !addedIds.has(p.id) && p.name.toLowerCase().includes(search.toLowerCase())
  )

  function addProduct(product: Product) {
    setItems(prev => [...prev, { product_id: product.id, product, color_name: '' }])
    setSearch('')
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.product_id !== productId))
  }

  function updateColorName(productId: string, colorName: string) {
    setItems(prev => prev.map(i => i.product_id === productId ? { ...i, color_name: colorName } : i))
  }

  function getProductImage(product: Product) {
    const imgs = [...(product.product_images || [])].sort((a, b) => (a.position || 0) - (b.position || 0))
    return imgs.find(i => i.is_primary)?.url || imgs[0]?.url || ''
  }

  function handleSubmit() {
    setError('')
    if (!groupName.trim()) { setError('Group name is required'); return }
    if (items.length < 2) { setError('Add at least 2 products'); return }
    const emptyColor = items.find(i => !i.color_name.trim())
    if (emptyColor) { setError(`Enter color name for "${emptyColor.product.name}"`); return }

    const fd = new FormData()
    if (group?.id) fd.append('id', group.id)
    fd.append('name', groupName)
    fd.append('items', JSON.stringify(items.map(i => ({ product_id: i.product_id, color_name: i.color_name.trim() }))))

    startTransition(() => { saveProductGroup(fd) })
  }

  const inputClass = 'rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent h-11 px-4 w-full'
  const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block'

  return (
    <div className="space-y-8">

      {/* Group Name */}
      <div>
        <Label className={labelClass}>Group Name</Label>
        <Input
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          className={inputClass}
          placeholder="e.g. Shahi Potli Series"
        />
      </div>

      {/* Added Products */}
      {items.length > 0 && (
        <div className="space-y-3">
          <p className={labelClass}>Products in Group ({items.length})</p>
          <div className="space-y-3">
            {items.map(item => {
              const img = getProductImage(item.product)
              const price = item.product.price_inr || item.product.price || 0
              return (
                <div key={item.product_id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0 relative">
                    {img ? <Image src={img} alt={item.product.name} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                  </div>
                  {/* Name + Price */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">₹{price.toLocaleString('en-IN')}</p>
                  </div>
                  {/* Color Name Input */}
                  <div className="w-36 shrink-0">
                    <input
                      value={item.color_name}
                      onChange={e => updateColorName(item.product_id, e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white text-xs font-medium px-3 h-9 focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none"
                      placeholder="Color name..."
                    />
                  </div>
                  {/* Remove */}
                  <button onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Product Search */}
      <div>
        <p className={labelClass}>Add Products</p>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Search products..."
          />
        </div>
        {search && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest py-6">No products found</p>
            ) : (
              filtered.slice(0, 20).map(product => {
                const img = getProductImage(product)
                const price = product.price_inr || product.price || 0
                return (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                      {img ? <Image src={img} alt={product.name} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">₹{price.toLocaleString('en-IN')}</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400 shrink-0" />
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs font-bold">{error}</p>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-full bg-[#1C1C1C] text-white px-10 py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF7A00] shadow-xl transition-all duration-300"
        >
          {isPending ? 'Saving...' : group ? 'Update Group' : 'Create Group'}
        </Button>
      </div>
    </div>
  )
}
