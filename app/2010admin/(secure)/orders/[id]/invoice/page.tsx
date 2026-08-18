import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
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
    .select(`id, quantity, price, products(name, sku)`)
    .eq('order_id', id)

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black min-h-screen print:p-0">
      <div className="border-8 border-black p-8 rounded-3xl">
        <div className="flex justify-between items-start mb-12 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-5xl font-sans font-black uppercase tracking-tighter leading-none mb-2">TAX INVOICE</h1>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Order #{order.order_number}</p>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Date: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">SHAHI BOUTIQUE</h2>
            <p className="text-sm font-medium">Telian Bazar, Malerkotla, Punjab 148023</p>
            <p className="text-sm font-medium mt-1">contact.shahiboutique@gmail.com | +91 9217890060</p>
            <p className="text-sm font-bold mt-2 tracking-widest text-[#FF7A00]">GSTIN: 07AAAAA0000A1Z5</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12 border-b-2 border-gray-100 pb-12">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-[#FF7A00]">Billed To</h3>
            <p className="font-bold text-xl uppercase tracking-wider mb-2">{order.customer_name || order.profiles?.full_name || 'Guest User'}</p>
            <p className="font-medium text-gray-600">{order.customer_email || order.profiles?.email}</p>
            {(order.customer_phone || order.profiles?.phone) && <p className="font-medium text-gray-600 mt-1">{order.customer_phone || order.profiles?.phone}</p>}
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-[#FF7A00]">Shipped To</h3>
            {order.shipping_address ? (
              <div className="font-medium text-gray-800 leading-relaxed uppercase">
                <p className="font-bold text-xl tracking-wider mb-2">{order.customer_name || 'Customer'}</p>
                <p>{order.shipping_address}</p>
                <p>{order.city}, {order.state} {order.postal_code}</p>
                <p>{order.country}</p>
                {order.customer_phone && <p className="mt-1">TEL: {order.customer_phone}</p>}
              </div>
            ) : (
              <p className="text-gray-400 italic font-medium">No shipping address</p>
            )}
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-black">
                <th className="py-4 font-black uppercase tracking-widest text-sm">Item</th>
                <th className="py-4 font-black uppercase tracking-widest text-sm text-center">Qty</th>
                <th className="py-4 font-black uppercase tracking-widest text-sm text-right">Price</th>
                <th className="py-4 font-black uppercase tracking-widest text-sm text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items?.map((item: any) => (
                <tr key={item.id} className="group">
                  <td className="py-6">
                    <p className="font-bold uppercase tracking-widest text-lg">{item.products?.name}</p>
                    <p className="text-xs font-bold text-gray-400 tracking-widest mt-1">SKU: {item.products?.sku || 'N/A'}</p>
                  </td>
                  <td className="py-6 text-center font-bold text-lg">{item.quantity}</td>
                  <td className="py-6 text-right font-medium text-gray-600">₹{Number(item.price).toFixed(2)}</td>
                  <td className="py-6 text-right font-black text-xl">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-gray-100 pt-8">
          <div className="w-80 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Subtotal</span>
              <span className="font-bold">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Shipping</span>
              <span className="font-bold">{order.shipping_cost > 0 ? `₹${order.shipping_cost}` : 'FREE'}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-xs font-bold uppercase tracking-widest">Discount</span>
                <span className="font-bold">-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t-4 border-black pt-4 mt-4">
              <span className="text-2xl font-black uppercase tracking-tighter">Total</span>
              <span className="text-3xl font-black tracking-tight text-[#FF7A00]">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t-2 border-dashed border-gray-200 text-center space-y-2">
          <p className="font-bold uppercase tracking-widest text-sm text-gray-900">Thank you for shopping with Shahi!</p>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method: {order.payment_method} | Status: <span className={order.payment_status === 'PAID' ? 'text-green-600 font-bold' : 'text-[#FF7A00] font-bold'}>{order.payment_status}</span></p>
          <p className="text-[10px] text-gray-400 mt-4">This is a computer-generated invoice and requires no signature.</p>
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
