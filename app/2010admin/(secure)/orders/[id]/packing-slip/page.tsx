import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black min-h-screen print:p-0">
      <div className="border-8 border-black p-8 rounded-3xl">
        <div className="flex justify-between items-start mb-12 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-5xl font-sans font-black uppercase tracking-tighter leading-none mb-2">PACKING SLIP</h1>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Order #{order.order_number}</p>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Date: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">SHAHI BOUTIQUE</h2>
            <p className="text-sm font-medium">Telian Bazar, Malerkotla, Punjab 148023</p>
          </div>
        </div>

        <div className="mb-12">
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-black inline-block min-w-[50%]">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Ship To:</h3>
            {order.shipping_address ? (
              <div className="font-black text-2xl uppercase leading-tight">
                <p>{order.customer_name || 'Customer'}</p>
                <p className="text-lg font-bold text-gray-800 mt-2">{order.shipping_address}</p>
                <p className="text-lg font-bold text-gray-800">{order.city}, {order.state} {order.postal_code}</p>
                <p className="text-lg font-bold text-gray-800">{order.country}</p>
                {order.customer_phone && <p className="text-sm font-bold text-gray-500 mt-4 tracking-widest">TEL: {order.customer_phone}</p>}
              </div>
            ) : (
              <p className="text-gray-400 italic font-medium">No shipping address</p>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Package Contents:</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="py-4 px-6 font-black uppercase tracking-widest text-sm w-24 text-center rounded-tl-xl">Qty</th>
                <th className="py-4 px-6 font-black uppercase tracking-widest text-sm">Item Description</th>
                <th className="py-4 px-6 font-black uppercase tracking-widest text-sm">SKU</th>
                <th className="py-4 px-6 font-black uppercase tracking-widest text-sm text-center w-32 rounded-tr-xl">Packed</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {items?.map((item: any) => (
                <tr key={item.id} className="border-b-2 border-gray-100">
                  <td className="py-6 px-6 text-center font-black text-3xl">{item.quantity}</td>
                  <td className="py-6 px-6">
                    <p className="font-bold uppercase tracking-widest text-xl">{item.products?.name}</p>
                  </td>
                  <td className="py-6 px-6 font-bold text-gray-500 tracking-widest">{item.products?.sku || 'N/A'}</td>
                  <td className="py-6 px-6 text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 rounded-lg mx-auto bg-gray-50"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 pt-8 border-t-4 border-black flex justify-between items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Shipping Method</p>
            <p className="text-2xl font-black uppercase mt-1">{order.courier_name || 'STANDARD SHIPPING'}</p>
          </div>
          <div className="text-right space-y-6">
            <div className="flex items-end gap-4 justify-end">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Packed By:</span>
              <div className="w-64 border-b-2 border-black"></div>
            </div>
            <div className="flex items-end gap-4 justify-end">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Date:</span>
              <div className="w-64 border-b-2 border-black"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 -mr-48 mt-4 w-40 text-sm text-gray-500 print:hidden p-4 bg-gray-100 rounded-lg border">
        <strong>To Download:</strong><br />
        Use the print dialog and select <br/><b>"Save as PDF"</b>.
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </div>
  )
}
