'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'
import { 
  getPublicCoupons, 
  calculateOrderTotal, 
  createCashfreeOrderAction,
  verifyAndCompleteCashfreeOrderAction,
  createConciergeOrderAction,
  CartInputItem
} from '@/lib/actions/checkout'
import { Ticket, X, Gift, ShoppingCart, ChevronDown, Mail, ShieldCheck, CreditCard, Tag } from 'lucide-react'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'
import { useCurrency, Currency, CURRENCY_TO_COUNTRY_CODE, COUNTRY_CODE_TO_CURRENCY } from '@/lib/contexts/CurrencyContext'

const COUNTRIES: { code: string; currency: Currency; label: string }[] = [
  { code: 'IN', currency: 'INR', label: '🇮🇳 India — INR ₹' },
  { code: 'US', currency: 'USD', label: '🇺🇸 United States — USD $' },
  { code: 'GB', currency: 'GBP', label: '🇬🇧 United Kingdom — GBP £' },
  { code: 'CA', currency: 'CAD', label: '🇨🇦 Canada — CAD C$' },
  { code: 'AU', currency: 'AUD', label: '🇦🇺 Australia — AUD A$' },
  { code: 'NZ', currency: 'NZD', label: '🇳🇿 New Zealand — NZD NZ$' },
]

const IN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Other'
]

export function CheckoutClient({ 
  codEnabled, 
  razorpayKeyId,
  cashfreeAppId,
  cashfreeMode = 'PRODUCTION',
  activePaymentGateway = 'CASHFREE',
  savedAddresses = [],
  userEmail,
  isGuest = false
}: { 
  codEnabled: boolean
  razorpayKeyId?: string
  cashfreeAppId?: string
  cashfreeMode?: string
  activePaymentGateway?: string
  savedAddresses?: any[] 
  userEmail?: string
  isGuest?: boolean
}) {
  const { currency, setCurrency, formatPrice } = useCurrency()
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultAddress = savedAddresses.find((a: any) => a.is_default) || savedAddresses[0] || null
  
  // Initial country derived from saved address or current active currency
  const initialCountryCode = defaultAddress?.country
    ? (defaultAddress.country === 'India' ? 'IN' : defaultAddress.country)
    : (CURRENCY_TO_COUNTRY_CODE[currency] || 'IN')

  // Order State
  const [address, setAddress] = useState({
    firstName: defaultAddress?.full_name?.split(' ')[0] || '',
    lastName: defaultAddress?.full_name?.split(' ').slice(1).join(' ') || '',
    email: userEmail || '',
    phone: defaultAddress?.phone || '',
    country: initialCountryCode,
    street: defaultAddress?.address_line1 || '',
    apartment: defaultAddress?.address_line2 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    zip: defaultAddress?.postal_code || ''
  })

  // PIN auto-fill state
  const [pinLookupLoading, setPinLookupLoading] = useState(false)

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, isFreeGift?: boolean} | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)

  // Live Totals
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, discount: 0, total: 0 })
  const [publicCoupons, setPublicCoupons] = useState<any[]>([])
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)

  // Load Cashfree JS SDK v3
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('cashfree-sdk-v3')) {
      const script = document.createElement('script')
      script.id = 'cashfree-sdk-v3'
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // India PIN auto-lookup
  async function lookupPin(pin: string) {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) return
    setPinLookupLoading(true)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0]
        setAddress(prev => ({
          ...prev,
          city: po.District || po.Block || po.Name || prev.city,
          state: po.State || prev.state
        }))
      }
    } catch {
      // silent
    } finally {
      setPinLookupLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (items.length > 0) {
      updateTotals(shippingMethod, appliedCoupon?.code, address.country)
      getPublicCoupons().then(coupons => setPublicCoupons(coupons))
    } else {
      router.push('/')
    }
  }, [items])

  // Sync country with currency if changed globally
  useEffect(() => {
    if (mounted) {
      const mappedCountry = CURRENCY_TO_COUNTRY_CODE[currency]
      if (mappedCountry && address.country !== mappedCountry && !defaultAddress) {
        setAddress(prev => ({ ...prev, country: mappedCountry }))
        updateTotals(shippingMethod, appliedCoupon?.code, mappedCountry)
      }
    }
  }, [currency])

  const updateTotals = async (currentShipping = shippingMethod, currentCoupon = appliedCoupon?.code, selectedCountry = address.country) => {
    try {
      const inputItems = items.map(i => ({ productId: i.productId || i.id, variantId: i.variantId, quantity: i.quantity }))
      const result = await calculateOrderTotal(inputItems, currentShipping, currentCoupon, selectedCountry || 'IN')
      setTotals({
        subtotal: result.subtotal,
        shipping: result.shipping,
        discount: result.discount,
        total: result.total
      })
    } catch (e: any) {
      setError(e.message || 'Error calculating totals')
    }
  }

  // Recalculate when shipping or currency changes
  useEffect(() => {
    if (mounted && items.length > 0) {
      updateTotals(shippingMethod, appliedCoupon?.code, address.country)
    }
  }, [shippingMethod, currency])

  if (!mounted || items.length === 0) return null

  const handleApplyCoupon = async (codeToApply?: string) => {
    setCouponError(null)
    setError(null)
    const code = (codeToApply || couponCode).trim().toUpperCase()
    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }
    try {
      const inputItems = items.map(i => ({ productId: i.productId || i.id, variantId: i.variantId, quantity: i.quantity }))
      const result = await calculateOrderTotal(inputItems, shippingMethod, code, address.country)
      if (result.couponApplied) {
        setAppliedCoupon({ code: code, discount: result.discount, isFreeGift: result.isFreeGift })
        setTotals({ subtotal: result.subtotal, shipping: result.shipping, discount: result.discount, total: result.total })
        setCouponCode(code)
        setCouponError(null)
      } else {
        const pc = publicCoupons.find(c => c.code.toUpperCase() === code)
        if (pc && totals.subtotal < pc.min_order_amount) {
          setCouponError(`Add ${formatPrice(pc.min_order_amount - totals.subtotal)} more to unlock this coupon`)
        } else {
          setCouponError('Invalid or expired coupon')
        }
        setAppliedCoupon(null)
      }
    } catch (e: any) {
      setCouponError(e.message || 'Error applying coupon')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
    updateTotals(shippingMethod, undefined, address.country)
  }

  const handlePlaceOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!address.firstName || !address.lastName || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
        throw new Error('Please fill in all required customer and shipping details')
      }

      const inputItems: CartInputItem[] = items.map(item => ({
        productId: item.productId || item.id,
        variantId: item.variantId || null,
        quantity: item.quantity
      }))

      if (paymentMethod === 'ONLINE') {
        // 1. Create Cashfree Order Session on Server
        const cfRes = await createCashfreeOrderAction(address, inputItems, shippingMethod, appliedCoupon?.code)
        
        if (!cfRes.success || !cfRes.paymentSessionId) {
          throw new Error(cfRes.error || 'Failed to initialize payment gateway. Please check gateway configuration.')
        }

        // 2. Open Cashfree Checkout Modal via JS SDK
        if (typeof window !== 'undefined' && (window as any).Cashfree) {
          const cashfree = (window as any).Cashfree({
            mode: (cfRes.environment || cashfreeMode || 'production').toLowerCase() === 'sandbox' ? 'sandbox' : 'production'
          })

          cashfree.checkout({
            paymentSessionId: cfRes.paymentSessionId,
            redirectTarget: '_modal'
          }).then(async (result: any) => {
            if (result?.error) {
              setError(result.error.message || 'Payment was cancelled or failed.')
              setLoading(false)
              return
            }

            // Verify order on server
            const verifyRes = await verifyAndCompleteCashfreeOrderAction(
              cfRes.cfOrderId!,
              address,
              inputItems,
              shippingMethod,
              appliedCoupon?.code
            )

            if (verifyRes.success && 'orderId' in verifyRes) {
              await clearCart()
              router.push(`/checkout/success?order_id=${verifyRes.orderId}`)
            } else {
              setError((verifyRes as any).error || 'Payment verification in progress. Please check your order status.')
              setLoading(false)
            }
          }).catch((err: any) => {
            console.error('Cashfree checkout modal error:', err)
            setError(err.message || 'Payment failed to complete. Please try again.')
            setLoading(false)
          })
        } else {
          // Fallback if SDK hasn't loaded yet
          throw new Error('Payment gateway is loading. Please wait a moment and try again.')
        }
      } else if (paymentMethod === 'COD') {
        const res = await createConciergeOrderAction(address, inputItems, shippingMethod, appliedCoupon?.code)
        if (res.success && 'orderId' in res) {
          await clearCart()
          router.push(`/checkout/success?order_id=${res.orderId}`)
        } else {
          throw new Error((res as any).error || 'Failed to create order')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout')
      setLoading(false)
    }
  }

  const renderOrderSummary = (isMobile = false) => (
    <div className={isMobile ? "" : "bg-[#F8F9FA] border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 sm:p-10 sticky top-32"}>
      {!isMobile && (
        <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-200 pb-6">
          Order Summary
        </h2>
      )}
      
      <ul role="list" className="divide-y divide-gray-200 mb-6 lg:mb-8">
        {items.map((item) => (
          <li key={item.id} className="flex py-4 lg:py-6">
            <div className="flex-shrink-0 relative w-16 h-24 lg:w-20 lg:h-28 bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100">
              <img src={item.image} alt={item.name} className="object-cover object-center w-full h-full" />
              <span className="absolute top-2 right-2 bg-[#1C1C1C] text-white rounded-full text-[9px] lg:text-[10px] w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center font-bold shadow-md">
                {item.quantity}
              </span>
            </div>
            <div className="ml-4 lg:ml-6 flex flex-1 flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[10px] lg:text-xs text-gray-900 uppercase tracking-widest leading-relaxed pr-4">{item.name}</p>
                  {(item.color || item.size) && (
                    <p className="text-[9px] lg:text-[10px] text-gray-500 mt-1 capitalize">
                      {item.color} {item.color && item.size && '|'} {item.size}
                    </p>
                  )}
                </div>
                <p className="text-xs lg:text-sm font-black text-[#FF7A00] tracking-wide"><PriceDisplay amount={((item.salePrice || item.price) * item.quantity)} /></p>
              </div>
            </div>
          </li>
        ))}
        {appliedCoupon?.isFreeGift && (
          <li className="flex py-4 lg:py-6 border-t border-dashed border-[#D4AF37]/30 mt-2">
            <div className="flex-shrink-0 relative w-16 h-24 lg:w-20 lg:h-28 bg-[#D4AF37]/10 flex items-center justify-center overflow-hidden rounded-xl shadow-sm border border-[#D4AF37]/30">
              <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-[#D4AF37]" />
              <span className="absolute top-2 right-2 bg-[#D4AF37] text-white rounded-full text-[9px] lg:text-[10px] w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center font-bold shadow-md">
                1
              </span>
            </div>
            <div className="ml-4 lg:ml-6 flex flex-1 flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[10px] lg:text-xs text-gray-900 uppercase tracking-widest leading-relaxed pr-4">Surprise Free Gift</p>
                  <p className="text-[8px] lg:text-[9px] text-[#D4AF37] font-black mt-1 lg:mt-2 uppercase tracking-widest bg-[#D4AF37]/10 inline-block px-2 py-1 rounded">Unlocked Offer</p>
                </div>
                <p className="text-xs lg:text-sm font-black text-[#D4AF37] tracking-wide">FREE</p>
              </div>
            </div>
          </li>
        )}
      </ul>

      {/* Coupon section in Order Summary */}
      <div className="border-t border-gray-200 pt-5 pb-5 space-y-3">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Discount code or coupon" 
            value={couponCode} 
            onChange={e => {
              setCouponCode(e.target.value.toUpperCase())
              if (couponError) setCouponError(null)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (!appliedCoupon) handleApplyCoupon()
              }
            }}
            disabled={!!appliedCoupon}
            className="flex-1 bg-white border border-gray-200 focus:border-[#FF7A00] focus:ring-0 rounded-full py-2.5 px-4 text-xs font-bold text-gray-900 shadow-xs outline-none transition-colors placeholder:text-gray-400 placeholder:font-normal disabled:bg-gray-100 uppercase" 
          />
          <button 
            type="button" 
            onClick={appliedCoupon ? handleRemoveCoupon : () => handleApplyCoupon()}
            className={`rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-200 shadow-xs shrink-0 ${
              appliedCoupon 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-[#1C1C1C] text-white hover:bg-[#FF7A00]'
            }`}
          >
            {appliedCoupon ? 'Remove' : 'Apply'}
          </button>
        </div>

        {couponError && (
          <p className="text-[11px] font-bold text-red-500 pl-2">
            {couponError}
          </p>
        )}

        {appliedCoupon && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3.5 py-2.5 text-emerald-800">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Coupon &lsquo;{appliedCoupon.code}&rsquo; Applied
            </span>
            <span className="text-xs font-black text-emerald-700">
              {appliedCoupon.isFreeGift ? 'FREE GIFT' : <span>-<PriceDisplay amount={totals.discount} /></span>}
            </span>
          </div>
        )}

        {/* Available Public Offers Trigger */}
        {publicCoupons.length > 0 && !appliedCoupon && (
          <button 
            type="button" 
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center justify-between w-full px-4 py-2.5 border border-dashed border-[#FF7A00]/40 bg-[#FF7A00]/5 rounded-2xl hover:bg-[#FF7A00]/10 transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#FF7A00] group-hover:rotate-12 transition-transform shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-900">View Available Offers</span>
            </div>
            <span className="text-[9px] font-black text-[#FF7A00] uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full shadow-xs border border-[#FF7A00]/20">
              {publicCoupons.length} Offers
            </span>
          </button>
        )}
      </div>

      <dl className="space-y-4 lg:space-y-6 text-xs lg:text-sm border-t border-gray-200 pt-6 lg:pt-8">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 font-bold tracking-widest uppercase text-[10px] lg:text-xs">Subtotal</dt>
          <dd className="font-black text-gray-900 tracking-wide"><PriceDisplay amount={totals.subtotal} /></dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 font-bold tracking-widest uppercase text-[10px] lg:text-xs">Shipping</dt>
          <dd className="font-black text-gray-900 tracking-wide">
            {totals.shipping === 0 ? 'FREE' : <PriceDisplay amount={totals.shipping} />}
          </dd>
        </div>
        {appliedCoupon && (
          <div className="flex items-center justify-between text-[#FF7A00]">
            <dt className="font-bold tracking-widest uppercase text-[10px] lg:text-xs">
              {appliedCoupon.isFreeGift ? `Free Gift (${appliedCoupon.code})` : `Discount (${appliedCoupon.code})`}
            </dt>
            <dd className="font-black tracking-wide">
              {appliedCoupon.isFreeGift ? 'FREE' : <span>-<PriceDisplay amount={totals.discount} /></span>}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 lg:pt-6 mt-4 lg:mt-6">
          <dt className="text-lg lg:text-xl font-sans font-black uppercase tracking-tighter text-gray-900">Total</dt>
          <dd className="text-xl lg:text-2xl font-black text-[#FF7A00] tracking-tight"><PriceDisplay amount={totals.total} /></dd>
        </div>
      </dl>
    </div>
  )

  const inputClasses = "w-full bg-white border border-gray-200 focus:border-[#FF7A00] focus:ring-0 rounded-full py-3.5 px-5 md:py-4 md:px-6 text-xs md:text-sm font-bold text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 placeholder:font-medium"

  return (
    <>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        
        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-6">
          <button 
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="w-full flex items-center justify-between bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200 focus:outline-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest">
              <ShoppingCart className="w-4 h-4 text-[#FF7A00]" />
              {isMobileSummaryOpen ? 'Hide' : 'Show'} Summary
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileSummaryOpen ? 'rotate-180' : ''}`} />
            </div>
            <span className="font-black text-lg text-[#FF7A00]"><PriceDisplay amount={totals.total} /></span>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${isMobileSummaryOpen ? 'max-h-[2000px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-200">
               {renderOrderSummary(true)}
            </div>
          </div>
        </div>

        {/* Main Checkout Flow */}
        <div className="lg:col-span-7">
          <div className="bg-[#F8F9FA] rounded-2xl md:rounded-[2rem] p-4 sm:p-8 md:p-12 border border-gray-100 space-y-8 md:space-y-12">

            {/* Optional Login Banner at Top */}
            {isGuest && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Have an account? Sign in for faster checkout (Optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a 
                    href="/login?next=/checkout" 
                    className="flex items-center justify-center gap-2.5 w-full border border-gray-200 rounded-full py-3 px-4 text-xs font-bold text-gray-700 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors bg-white shadow-xs"
                  >
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>Email & Password</span>
                  </a>
                  <a 
                    href="/api/auth/google?next=/checkout" 
                    className="flex items-center justify-center gap-2.5 w-full border border-gray-200 rounded-full py-3 px-4 text-xs font-bold text-gray-700 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors bg-white shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </a>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">or continue as guest</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs tracking-widest uppercase font-bold text-center">
                {error}
              </div>
            )}

            {/* STEP 1: Customer Details */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs mr-4 transition-colors shadow-sm ${step === 1 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                Customer Details
              </h2>
              {step === 1 ? (
                <div className="space-y-6">
                  {/* Saved addresses (if logged-in) */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Saved Addresses</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {savedAddresses.map((sa: any) => {
                          const isSelected = address.street === sa.address_line1 && address.city === sa.city
                          return (
                            <div 
                              key={sa.id} 
                              onClick={() => {
                                const saCountry = sa.country === 'India' ? 'IN' : (sa.country || 'IN')
                                const matchedCurrency = COUNTRY_CODE_TO_CURRENCY[saCountry] || 'INR'
                                setCurrency(matchedCurrency)
                                setAddress({
                                  firstName: sa.full_name?.split(' ')[0] || '',
                                  lastName: sa.full_name?.split(' ').slice(1).join(' ') || '',
                                  email: userEmail || '',
                                  phone: sa.phone || '',
                                  country: saCountry,
                                  street: sa.address_line1 || '',
                                  apartment: sa.address_line2 || '',
                                  city: sa.city || '',
                                  state: sa.state || '',
                                  zip: sa.postal_code || '',
                                })
                                updateTotals(shippingMethod, appliedCoupon?.code, saCountry)
                              }}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'border-[#1C1C1C] bg-white ring-2 ring-[#1C1C1C] shadow-sm' : 'border-gray-200 bg-white/70 hover:border-gray-300'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-xs text-gray-900 uppercase tracking-widest">{sa.full_name}</p>
                                {sa.is_default && <span className="text-[8px] bg-black text-white px-2 py-0.5 rounded-sm uppercase tracking-widest">Default</span>}
                              </div>
                              <p className="text-[10px] text-gray-500 font-medium">{sa.address_line1}{sa.address_line2 ? `, ${sa.address_line2}` : ''}</p>
                              <p className="text-[10px] text-gray-500 font-medium">{sa.city}, {sa.state} {sa.postal_code}</p>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">or enter details below</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    </div>
                  )}

                  {/* Customer Details Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First & Last Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">First Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={address.firstName} 
                        onChange={e => setAddress({...address, firstName: e.target.value})} 
                        placeholder="First name" 
                        className={inputClasses} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={address.lastName} 
                        onChange={e => setAddress({...address, lastName: e.target.value})} 
                        placeholder="Last name" 
                        className={inputClasses} 
                      />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email *</label>
                      <input 
                        type="email" 
                        required 
                        value={address.email} 
                        onChange={e => setAddress({...address, email: e.target.value})} 
                        placeholder="your@email.com" 
                        className={inputClasses} 
                      />
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone *</label>
                      <input 
                        type="tel" 
                        required 
                        value={address.phone} 
                        onChange={e => setAddress({...address, phone: e.target.value.replace(/\D/g, '')})} 
                        placeholder="Phone number" 
                        maxLength={15} 
                        className={inputClasses} 
                      />
                    </div>

                    {/* Country/Region Dropdown in exact format requested */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Country / Region 🌍 *</label>
                      <select 
                        value={address.country} 
                        onChange={e => {
                          const newCountry = e.target.value
                          const matchedItem = COUNTRIES.find(c => c.code === newCountry)
                          if (matchedItem) {
                            setCurrency(matchedItem.currency)
                          }
                          setAddress({...address, country: newCountry, state: '', zip: '', city: ''})
                          updateTotals(shippingMethod, appliedCoupon?.code, newCountry)
                        }} 
                        className={inputClasses}
                      >
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Address *</label>
                      <input 
                        type="text" 
                        required 
                        value={address.street} 
                        onChange={e => setAddress({...address, street: e.target.value})} 
                        placeholder="House / Flat no., Building, Street name, Area" 
                        className={inputClasses} 
                      />
                    </div>

                    {/* Apartment/Suite (optional) */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Apartment / Suite <span className="text-gray-400 normal-case font-normal">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={address.apartment} 
                        onChange={e => setAddress({...address, apartment: e.target.value})} 
                        placeholder="Apt, Suite, Floor, Landmark (optional)" 
                        className={inputClasses} 
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">City *</label>
                      <input 
                        type="text" 
                        required 
                        value={address.city} 
                        onChange={e => setAddress({...address, city: e.target.value})} 
                        placeholder="City" 
                        className={inputClasses} 
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">State *</label>
                      {address.country === 'IN' ? (
                        <select 
                          required 
                          value={address.state} 
                          onChange={e => setAddress({...address, state: e.target.value})} 
                          className={inputClasses}
                        >
                          <option value="">Select State</option>
                          {IN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          required 
                          value={address.state} 
                          onChange={e => setAddress({...address, state: e.target.value})} 
                          placeholder="State / Province" 
                          className={inputClasses} 
                        />
                      )}
                    </div>

                    {/* PIN / ZIP Code */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        PIN / ZIP Code *
                        {pinLookupLoading && (
                          <span className="ml-2 text-[#FF7A00] normal-case tracking-normal font-medium text-[10px]">
                            Auto-fetching city & state...
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={address.zip}
                        onChange={e => {
                          const val = e.target.value
                          const sanitized = address.country === 'IN' ? val.replace(/\D/g, '') : val
                          setAddress({...address, zip: sanitized})
                          if (address.country === 'IN' && sanitized.length === 6) {
                            lookupPin(sanitized)
                          }
                        }}
                        placeholder={address.country === 'IN' ? '6-digit PIN code (auto-fills city & state)' : 'ZIP / Postal Code'}
                        maxLength={address.country === 'IN' ? 6 : 10}
                        className={inputClasses}
                      />
                      {address.country === 'IN' && address.zip.length === 6 && !pinLookupLoading && address.city && (
                        <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-1">
                          ✓ Auto-detected: {address.city}, {address.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={() => {
                        if (!address.firstName || !address.lastName || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
                          setError('Please fill in all required fields')
                          return
                        }
                        setError(null)
                        setStep(2)
                      }}
                      className="w-full rounded-full bg-[#1C1C1C] text-white py-4 md:py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-md"
                    >
                      Continue to Delivery
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 pl-4 sm:pl-12">
                  <p className="font-bold text-gray-900">{address.firstName} {address.lastName}</p>
                  <p className="font-medium mt-1">
                    {address.street}{address.apartment ? `, ${address.apartment}` : ''}, {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="font-medium mt-1">{address.email} · {address.phone}</p>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#1C1C1C] transition-colors mt-4"
                  >
                    Edit Details
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: Delivery */}
            <div className={`border-t border-gray-200 pt-8 md:pt-12 ${step < 2 ? 'opacity-40 pointer-events-none grayscale' : 'transition-opacity duration-500'}`}>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs mr-4 transition-colors shadow-sm ${step === 2 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                Delivery Method
              </h2>
              {step === 2 ? (
                <div className="space-y-4 pl-0 sm:pl-12">
                  <label className="flex items-center justify-between p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-[#FF7A00] bg-white ring-4 ring-[#FF7A00]/10">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-[5px] border-[#FF7A00] bg-white"></div>
                      <div className="ml-4">
                        <span className="block text-sm font-bold text-gray-900 uppercase tracking-widest">
                          {address.country === 'IN' ? 'Standard Domestic Shipping' : 'International Express Shipping'}
                        </span>
                        <span className="block text-xs text-gray-500 font-medium mt-1">
                          {address.country === 'IN' ? '3-5 business days' : '7-10 business days'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 tracking-wide">
                      {totals.shipping === 0 ? 'FREE' : <PriceDisplay amount={totals.shipping} />}
                    </span>
                  </label>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => setStep(3)}
                      className="w-full rounded-full bg-[#1C1C1C] text-white py-4 md:py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-md"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : step > 2 ? (
                <div className="text-sm text-gray-500 pl-4 sm:pl-12 flex justify-between items-center">
                  <p className="font-bold text-gray-900">
                    {address.country === 'IN' ? 'Standard Domestic Shipping (3-5 days)' : 'International Express Shipping (7-10 days)'}
                  </p>
                </div>
              ) : null}
            </div>

            {/* STEP 3: Payment */}
            <div className={`border-t border-gray-200 pt-8 md:pt-12 ${step < 3 ? 'opacity-40 pointer-events-none grayscale' : 'transition-opacity duration-500'}`}>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs mr-4 transition-colors shadow-sm ${step === 3 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
                Payment
              </h2>
              {step === 3 && (
                <div className="space-y-8 md:space-y-10 pl-0 sm:pl-12">
                  
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    {/* Primary Online Payment (Cashfree) */}
                    <label 
                      onClick={() => setPaymentMethod('ONLINE')}
                      className={`flex items-start sm:items-center p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${paymentMethod === 'ONLINE' ? 'border-[#FF7A00] bg-white ring-4 ring-[#FF7A00]/10 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                    >
                      <input 
                        type="radio" 
                        name="payment" 
                        value="ONLINE" 
                        checked={paymentMethod === 'ONLINE'} 
                        onChange={() => setPaymentMethod('ONLINE')}
                        className="h-5 w-5 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-300 mt-0.5 sm:mt-0 shrink-0" 
                      />
                      <div className="ml-3 md:ml-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="block text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest leading-tight">
                            Instant Online Payment
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            100% Secure &amp; Encrypted
                          </span>
                        </div>
                        <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-1">
                          UPI (GPay / PhonePe / Paytm), Credit &amp; Debit Cards, NetBanking &amp; International Cards.
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">UPI</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Visa / Master</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">RuPay</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">NetBanking</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 rounded">International Cards</span>
                        </div>
                      </div>
                    </label>

                    {/* Secondary COD / WhatsApp (Only if enabled in admin) */}
                    {codEnabled && (
                      <label 
                        onClick={() => setPaymentMethod('COD')}
                        className={`flex items-start sm:items-center p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${paymentMethod === 'COD' ? 'border-[#FF7A00] bg-white ring-4 ring-[#FF7A00]/10 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                      >
                        <input 
                          type="radio" 
                          name="payment" 
                          value="COD" 
                          checked={paymentMethod === 'COD'} 
                          onChange={() => setPaymentMethod('COD')}
                          className="h-5 w-5 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-300 mt-0.5 sm:mt-0 shrink-0" 
                        />
                        <div className="ml-3 md:ml-4 flex-1">
                          <span className="block text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest leading-tight">
                            Concierge WhatsApp / Offline
                          </span>
                          <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-1">
                            Place order now; our concierge team will reach out on WhatsApp to collect payment.
                          </span>
                        </div>
                      </label>
                    )}
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full rounded-full bg-[#FF7A00] text-white py-5 md:py-6 text-xs md:text-sm font-black uppercase tracking-widest hover:bg-[#1C1C1C] transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        'Securing Payment...'
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Pay <PriceDisplay amount={totals.total} /> &amp; Place Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="hidden lg:block lg:col-span-5 mt-8 md:mt-12 lg:mt-0">
          {renderOrderSummary()}
        </div>

      </div>

      {/* View Offers Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
          <div className="bg-white w-full sm:w-[480px] h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
                <Ticket className="w-5 h-5 text-[#FF7A00]" />
                Available Offers
              </h3>
              <button 
                onClick={() => setIsCouponModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
              {publicCoupons.map(coupon => {
                const isLocked = totals.subtotal < coupon.min_order_amount;
                return (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => {
                      handleApplyCoupon(coupon.code)
                      if (!isLocked) setIsCouponModalOpen(false)
                    }}
                    className={`w-full flex flex-col items-start p-6 border rounded-2xl text-left transition-all duration-300 relative overflow-hidden group ${isLocked ? 'border-gray-200 bg-gray-50 opacity-60 hover:bg-gray-100' : 'border-[#FF7A00]/30 bg-[#FF7A00]/5 hover:bg-[#FF7A00]/10 hover:border-[#FF7A00]'}`}
                  >
                    {!isLocked && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF7A00]/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    )}
                    
                    <div className="flex items-start justify-between w-full">
                      <span className="font-black text-sm text-gray-900 tracking-wide border border-dashed border-gray-300 px-3 py-1 rounded bg-white">{coupon.code}</span>
                      {!isLocked && <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 px-2 py-1 rounded">Apply</span>}
                    </div>
                    
                    <span className="text-xs font-bold text-gray-800 mt-4 uppercase tracking-widest">
                      {coupon.discount_type === 'PERCENTAGE' 
                        ? `${coupon.discount_value}% OFF` 
                        : coupon.discount_value === 0 
                          ? 'FREE GIFT ON ORDER' 
                          : `FLAT ${formatPrice(coupon.discount_value)} OFF`}
                    </span>
                    
                    {coupon.min_order_amount > 0 && (
                      <span className="text-[10px] text-gray-500 font-medium mt-1">
                        On orders above <PriceDisplay amount={coupon.min_order_amount} />
                      </span>
                    )}

                    {isLocked && (
                      <span className="text-[10px] text-red-500 font-bold mt-4 uppercase tracking-wide flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg w-full">
                        Add {formatPrice(coupon.min_order_amount - totals.subtotal)} more to unlock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
