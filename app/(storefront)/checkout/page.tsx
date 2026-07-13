import { CheckoutClient } from '@/components/storefront/CheckoutClient'
import { getStoreSettings } from '@/lib/actions/settings'
import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout | SHAHI',
  description: 'Complete your purchase securely.',
}

export default async function CheckoutPage() {
  const user = await requireAuth('/checkout')
  const settings = await getStoreSettings()
  
  // Fetch checkout notice
  const { getActiveAnnouncements } = await import('@/lib/actions/announcements')
  const announcements = await getActiveAnnouncements()
  const checkoutNotice = announcements.find((a: any) => a.display_type === 'CHECKOUT_NOTICE')

  const supabase = createAdminClient()
  
  // Fetch Saved Addresses
  const { data: savedAddresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  return (
    <div className="bg-white min-h-screen pb-16 md:pb-32">
      <div className="bg-[#F8F9FA] py-8 md:py-16 px-4 text-center rounded-b-3xl md:rounded-b-[3rem] mb-6 md:mb-16 shadow-sm md:shadow-none">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-1 md:mb-4 leading-none">
          SECURE CHECKOUT
        </h1>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 space-y-6">
        {checkoutNotice && (
          <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h3 className="font-black text-[#FF7A00] uppercase tracking-widest text-sm">{checkoutNotice.title}</h3>
              {checkoutNotice.description && (
                <p className="text-gray-700 font-medium text-sm mt-1">{checkoutNotice.description}</p>
              )}
            </div>
            {checkoutNotice.action_link && checkoutNotice.action_text && (
              <a href={checkoutNotice.action_link} className="shrink-0 bg-[#FF7A00] text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#e06c00] transition-colors">
                {checkoutNotice.action_text}
              </a>
            )}
          </div>
        )}

        <CheckoutClient 
          codEnabled={settings.cod_enabled === 'true'} 
          razorpayKeyId={settings.razorpay_key_id || ''} 
          savedAddresses={savedAddresses || []}
          userEmail={user.email}
        />
      </div>
    </div>
  )
}
