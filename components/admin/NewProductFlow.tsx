'use client'

import { useState } from 'react'
import { ProductForm } from '@/components/admin/ProductForm'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, MessageSquareText } from 'lucide-react'

export function NewProductFlow({ categories }: { categories: any[] }) {
  const [productMode, setProductMode] = useState<'regular' | 'enquiry' | null>(null)

  if (productMode === 'regular' || productMode === 'enquiry') {
    return <ProductForm categories={categories} mode={productMode} />
  }

  const cardClass = "rounded-[2rem] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      <Card className={cardClass} onClick={() => setProductMode('regular')}>
        <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center h-full">
          <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#111111] transition-all duration-300">
            <ShoppingBag className="h-8 w-8 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-3">Regular Product</h3>
          <p className="text-sm text-gray-500 font-medium">Standard e-commerce product with fixed price, inventory tracking, and "Add to Cart" checkout flow.</p>
        </CardContent>
      </Card>

      <Card className={`${cardClass} border-[#D4AF37]/30 shadow-[#D4AF37]/5`} onClick={() => setProductMode('enquiry')}>
        <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center h-full">
          <div className="h-16 w-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#D4AF37] transition-all duration-300">
            <MessageSquareText className="h-8 w-8 text-[#D4AF37] group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-3">Enquiry Product</h3>
          <p className="text-sm text-gray-500 font-medium">Custom or premium product with a "Starting Price". Customers will request quotes via an "Enquire Now" button.</p>
        </CardContent>
      </Card>
    </div>
  )
}
