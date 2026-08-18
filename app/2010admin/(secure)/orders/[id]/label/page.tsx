import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const id = p.id;
  const supabase = createAdminClient()
  
  const { data: order } = await supabase
    .from('orders')
    .select(`*, profiles(full_name, email, phone)`)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select(`id, quantity, products(name, sku)`)
    .eq('order_id', id)

  // A simulated barcode pattern
  const barcodeLines = Array.from({ length: 48 }).map((_, i) => {
    const width = [2, 3, 4, 6][Math.floor(Math.random() * 4)]
    const margin = [1, 2, 3][Math.floor(Math.random() * 3)]
    return (
      <div 
        key={i} 
        className="bg-black h-24" 
        style={{ width: `${width}px`, marginRight: `${margin}px` }}
      />
    )
  })

  return (
    <div className="w-[4in] h-[6in] mx-auto bg-white text-black p-6 border-2 border-gray-200 print:border-none shadow-xl print:shadow-none relative flex flex-col justify-between">
      {/* Download Instructions overlay (Hidden on Print) */}
      <div className="absolute top-0 right-0 -mr-48 mt-4 w-40 text-sm text-gray-500 print:hidden p-4 bg-gray-100 rounded-lg border">
        <strong>To Print:</strong><br />
        Set paper size to 4" x 6".<br/>Scale to 100%.
      </div>

      {/* Header section */}
      <div>
        <div className="border-b-4 border-black pb-4 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">SHAHI BOUTIQUE</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Telian Bazar</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Malerkotla, Punjab 148023</p>
          </div>
          <div className="text-right bg-black text-white px-4 py-2 rounded-lg">
            <p className="text-2xl font-black tracking-widest">{order.shipping_cost === 0 || !order.shipping_cost ? 'FREE' : 'PAID'}</p>
          </div>
        </div>

        {/* Ship To Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#FF7A00]">Ship To:</h2>
          {order.shipping_address ? (
            <div className="text-lg font-black uppercase leading-tight">
              <p className="text-2xl mb-1">{order.customer_name || 'Customer'}</p>
              <p className="text-gray-800">{order.shipping_address}</p>
              <p className="text-gray-800">{order.city}, {order.state}</p>
              <p className="text-2xl mt-1 tracking-widest">{order.postal_code}</p>
              <p className="text-gray-800">{order.country}</p>
              {order.customer_phone && <p className="mt-3 text-xs font-bold tracking-widest text-gray-500">TEL: {order.customer_phone}</p>}
            </div>
          ) : (
            <p className="text-sm italic font-medium">No Address Provided</p>
          )}
        </div>
      </div>

      {/* Footer / Barcode section */}
      <div className="mt-auto">
        <div className="border-y-4 border-black py-4 mb-4 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Courier / Service</p>
            <p className="text-xl font-black uppercase tracking-tighter">{order.courier_name || 'STANDARD'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Weight</p>
            <p className="text-xl font-black uppercase tracking-tighter">1.5 KG</p>
          </div>
        </div>

        {/* Fake Barcode */}
        <div className="flex items-center justify-center my-4 overflow-hidden px-2">
          {barcodeLines}
        </div>
        
        <div className="text-center mb-6">
          <p className="text-lg font-black tracking-[0.25em]">{order.tracking_number || order.order_number}</p>
        </div>

        <div className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-widest border-t border-gray-300 pt-2">
          {items?.length} Items Enclosed • Handle With Care
        </div>
      </div>

      {/* Auto trigger print on load */}
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
