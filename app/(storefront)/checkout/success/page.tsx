import { createAdminClient, createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default async function SuccessPage({ searchParams }: { searchParams: { order_id?: string } }) {
  const params = await searchParams;
  const orderId = params.order_id

  if (!orderId) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-white">
        <div className="text-center bg-[#F8F9FA] p-16 rounded-[3rem]">
          <h1 className="text-4xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-4">Order Not Found</h1>
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#1C1C1C] transition-colors">Return to Homepage</Link>
        </div>
      </div>
    )
  }

  const supabaseAdmin = createAdminClient()
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single()
  
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 md:px-6 py-16 md:py-24 bg-white">
      <div className="bg-[#F8F9FA] w-full max-w-2xl rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 md:p-16 flex flex-col items-center border border-gray-100">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 sm:mb-8 shrink-0">
          <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-[#FF7A00]" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-sans font-black text-gray-900 mb-4 uppercase tracking-tighter text-center leading-none">Order Confirmed</h1>
        
        <p className="text-gray-500 font-medium mb-4 sm:mb-6 text-center max-w-md text-sm sm:text-base leading-relaxed">
          Thank you for your purchase. Your order <span className="font-bold text-gray-900">#{order?.order_number || orderId.substring(0, 8)}</span> has been successfully placed.
        </p>

        {order?.payment_method === 'COD' && order?.payment_status === 'PENDING' && (
          <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-2xl p-4 sm:p-5 mb-8 w-full max-w-md text-center">
            <p className="text-xs sm:text-sm text-[#FF7A00] font-bold uppercase tracking-wide">
              Payment Pending
            </p>
            <p className="text-[10px] sm:text-xs text-gray-700 mt-2 leading-relaxed">
              Our concierge team will contact you shortly on WhatsApp or Email with the payment details to finalize your order.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 p-5 sm:p-8 w-full mb-8 sm:mb-10 shadow-sm">
          <h2 className="text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest mb-4 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4">Order Details</h2>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-500 font-medium">
            <p className="flex justify-between items-center"><span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-gray-400 font-bold">Order Status</span> <span className="font-bold text-[#FF7A00] uppercase tracking-widest text-[10px] sm:text-xs">{order?.status || 'Processing'}</span></p>
            <p className="flex justify-between items-center"><span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-gray-400 font-bold">Payment Status</span> <span className={`font-bold uppercase tracking-widest text-[10px] sm:text-xs ${order?.payment_status === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>{order?.payment_status || 'PENDING'}</span></p>
            <p className="flex justify-between items-center"><span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-gray-400 font-bold">Payment Method</span> <span className="font-bold text-gray-900 uppercase tracking-widest text-[10px] sm:text-xs">{order?.payment_method === 'COD' ? 'Concierge WhatsApp' : order?.payment_method}</span></p>
            <p className="flex justify-between items-center border-t border-gray-100 pt-3 sm:pt-4 mt-2"><span className="uppercase tracking-widest text-[10px] sm:text-xs text-gray-900 font-black">Total Amount</span> <span className="font-black text-lg sm:text-xl text-gray-900">₹{(order?.total_amount || 0).toFixed(2)}</span></p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-4">
          <Link href="/shop" className="flex-1 bg-[#1C1C1C] text-white rounded-full py-4 sm:py-5 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-md text-center">
            Continue Shopping
          </Link>
          {user && (
            <Link href="/account/orders" className="flex-1 bg-white text-gray-900 border border-gray-200 rounded-full py-4 sm:py-5 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors duration-300 text-center">
              View Order History
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
