import { CheckoutClient } from '@/components/storefront/CheckoutClient'
import { getStoreSettings } from '@/lib/actions/settings'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout | SHAHI',
  description: 'Complete your purchase securely.',
}

export default async function CheckoutPage() {
  const user = await getCurrentUser() // optional — guests allowed
  const settings = await getStoreSettings()
  
  const { getActiveAnnouncements } = await import('@/lib/actions/announcements')
  const announcements = await getActiveAnnouncements()
  const checkoutNotice = announcements.find((a: any) => a.display_type === 'CHECKOUT_NOTICE')

  const supabase = createAdminClient()
  
  // Saved addresses only if logged in
  const savedAddresses = user?.id ? await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .then(({ data }) => data || []) : []
  
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-16 md:pb-28">
      {/* Sleek Compact Header */}
      <div className="bg-white border-b border-gray-100 py-5 sm:py-8 md:py-10 px-4 text-center mb-4 sm:mb-8 md:mb-10">
        <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FF7A00] mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          256-Bit Encrypted &amp; Secure
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-gray-900 uppercase">
          Express Checkout
        </h1>
      </div>
      
      <div className="mx-auto max-w-7xl px-3.5 sm:px-8 lg:px-12 space-y-5 sm:space-y-6">
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
          cashfreeAppId={settings.cashfree_app_id || ''}
          cashfreeMode={settings.cashfree_mode || 'PRODUCTION'}
          activePaymentGateway={settings.active_payment_gateway || 'CASHFREE'}
          savedAddresses={savedAddresses}
          userEmail={user?.email}
          isGuest={!user}
        />
      </div>
    </div>
  )
}
