'use client'

import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  getPublicCoupons, 
  calculateOrderTotal, 
  createCashfreeOrderAction,
  verifyAndCompleteCashfreeOrderAction,
  createConciergeOrderAction,
  CartInputItem
} from '@/lib/actions/checkout'
import { submitInternationalOrderRequest } from '@/lib/actions/international-orders'
import { 
  sendLoginOTP, 
  verifyLoginOTP, 
  completeCustomerProfile, 
  getCustomerDetailsByEmail 
} from '@/lib/actions/auth-email'
import { 
  Ticket, X, Gift, ShoppingCart, ChevronDown, Mail, ShieldCheck, CreditCard, 
  Tag, RefreshCw, AlertCircle, MessageCircle, Globe, Plane, CheckCircle2, 
  Copy, Check, ArrowRight, Clock, HelpCircle, User, Phone, Sparkles, KeyRound, Lock
} from 'lucide-react'
import { PriceDisplay } from '@/components/storefront/PriceDisplay'
import { useCurrency, Currency, CURRENCY_TO_COUNTRY_CODE, COUNTRY_CODE_TO_CURRENCY } from '@/lib/contexts/CurrencyContext'

const COUNTRIES: { code: string; currency: Currency; label: string; flag: string }[] = [
  { code: 'IN', currency: 'INR', label: 'India — INR (₹)', flag: '🇮🇳' },
  { code: 'US', currency: 'USD', label: 'United States — USD ($)', flag: '🇺🇸' },
  { code: 'GB', currency: 'GBP', label: 'United Kingdom — GBP (£)', flag: '🇬🇧' },
  { code: 'CA', currency: 'CAD', label: 'Canada — CAD (C$)', flag: '🇨🇦' },
  { code: 'AU', currency: 'AUD', label: 'Australia — AUD (A$)', flag: '🇦🇺' },
  { code: 'NZ', currency: 'NZD', label: 'New Zealand — NZD (NZ$)', flag: '🇳🇿' },
  { code: 'AE', currency: 'USD', label: 'United Arab Emirates — AED (د.إ)', flag: '🇦🇪' },
  { code: 'SA', currency: 'USD', label: 'Saudi Arabia — SAR (﷼)', flag: '🇸🇦' },
  { code: 'SG', currency: 'USD', label: 'Singapore — SGD (S$)', flag: '🇸🇬' },
  { code: 'DE', currency: 'USD', label: 'Germany & EU — EUR (€)', flag: '🇪🇺' },
  { code: 'QA', currency: 'USD', label: 'Qatar — QAR (﷼)', flag: '🇶🇦' },
  { code: 'KW', currency: 'USD', label: 'Kuwait — KWD (د.ك)', flag: '🇰🇼' },
  { code: 'MY', currency: 'USD', label: 'Malaysia — MYR (RM)', flag: '🇲🇾' },
  { code: 'OTHER', currency: 'USD', label: 'Worldwide / Other Countries — USD ($)', flag: '🌐' },
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

  // User Authentication & Inline OTP State
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(userEmail)
  const [isGuestUser, setIsGuestUser] = useState(isGuest)
  const [userAddresses, setUserAddresses] = useState<any[]>(savedAddresses || [])

  const [isOtpCardOpen, setIsOtpCardOpen] = useState(false)
  const [otpStep, setOtpStep] = useState<'email' | 'otp' | 'profile'>('email')
  const [otpEmailInput, setOtpEmailInput] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const [otpName, setOtpName] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpMessage, setOtpMessage] = useState<string | null>(null)
  const [otpResendCountdown, setOtpResendCountdown] = useState(0)
  const [otpIsResending, setOtpIsResending] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 60-second Resend countdown timer for checkout OTP
  useEffect(() => {
    let timer: any
    if (otpResendCountdown > 0) {
      timer = setInterval(() => {
        setOtpResendCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [otpResendCountdown])

  // Focus first digit box when moving to OTP step
  useEffect(() => {
    if (otpStep === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 150)
    }
  }, [otpStep])

  // Handle individual digit input
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '')
    const newDigits = [...otpDigits]

    if (!clean) {
      newDigits[index] = ''
      setOtpDigits(newDigits)
      return
    }

    const digit = clean.slice(-1)
    newDigits[index] = digit
    setOtpDigits(newDigits)
    setOtpError(null)

    if (index < 3 && digit) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle clipboard paste of 4 digits
  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pasted[i] || ''
      }
      setOtpDigits(newDigits)
      setOtpError(null)
      const targetFocus = Math.min(pasted.length, 3)
      otpInputRefs.current[targetFocus]?.focus()
    }
  }

  // Send OTP from checkout
  async function handleSendCheckoutOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOtpError(null)
    setOtpMessage(null)
    setOtpLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailVal = (formData.get('email') as string)?.trim().toLowerCase()
    setOtpEmailInput(emailVal)

    try {
      const res = await sendLoginOTP(formData)
      if (res.error) {
        setOtpError(res.error)
      } else {
        setOtpStep('otp')
        setOtpDigits(['', '', '', ''])
        setOtpResendCountdown(60)
        setOtpMessage('A 4-digit code has been sent to your email.')
      }
    } catch {
      setOtpError('Failed to send verification code. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Resend OTP from checkout
  async function handleResendCheckoutOTP() {
    if (otpResendCountdown > 0 || otpIsResending || !otpEmailInput) return
    setOtpIsResending(true)
    setOtpError(null)
    setOtpMessage(null)

    try {
      const formData = new FormData()
      formData.append('email', otpEmailInput)
      const res = await sendLoginOTP(formData)
      if (res.error) {
        setOtpError(res.error)
      } else {
        setOtpResendCountdown(60)
        setOtpDigits(['', '', '', ''])
        otpInputRefs.current[0]?.focus()
        setOtpMessage('A fresh 4-digit code has been sent to your email.')
      }
    } catch {
      setOtpError('Failed to resend code.')
    } finally {
      setOtpIsResending(false)
    }
  }

  // Verify OTP from checkout
  async function handleVerifyCheckoutOTP(e: React.FormEvent) {
    e.preventDefault()
    const currentCode = otpDigits.join('')
    if (currentCode.length !== 4) {
      setOtpError('Please enter all 4 digits.')
      return
    }

    setOtpError(null)
    setOtpMessage(null)
    setOtpLoading(true)

    const formData = new FormData()
    formData.append('email', otpEmailInput)
    formData.append('otp', currentCode)

    try {
      const res = await verifyLoginOTP(formData)
      if (res.error) {
        setOtpError(res.error)
      } else if (res.requiresProfile) {
        if (res.existingName) setOtpName(res.existingName)
        if (res.existingPhone) setOtpPhone(res.existingPhone)
        setOtpStep('profile')
        setOtpMessage('Code verified! Please complete your name & phone.')
      } else {
        await handlePostLoginSuccess(otpEmailInput)
      }
    } catch {
      setOtpError('An unexpected error occurred.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Complete Profile from checkout
  async function handleCompleteCheckoutProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOtpError(null)
    setOtpMessage(null)
    setOtpLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('email', otpEmailInput)

    try {
      const res = await completeCustomerProfile(formData)
      if (res.error) {
        setOtpError(res.error)
      } else {
        await handlePostLoginSuccess(otpEmailInput)
      }
    } catch {
      setOtpError('Failed to complete profile.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Post Login Auto-Fill Routine
  async function handlePostLoginSuccess(email: string) {
    setCurrentUserEmail(email)
    setIsGuestUser(false)
    setIsOtpCardOpen(false)
    setOtpStep('email')

    try {
      const details = await getCustomerDetailsByEmail(email)
      if (details.success) {
        const profile = details.profile
        const addrs = details.addresses || []
        
        setUserAddresses(addrs)

        let fName = address.firstName
        let lName = address.lastName
        let ph = address.phone

        if (profile?.name) {
          const parts = profile.name.trim().split(' ')
          fName = parts[0] || fName
          lName = parts.slice(1).join(' ') || lName
        }
        if (profile?.phone) {
          ph = profile.phone
        }

        const defAddr = addrs.find((a: any) => a.is_default) || addrs[0]
        if (defAddr) {
          const defCountry = defAddr.country === 'India' ? 'IN' : (defAddr.country || 'IN')
          const matchedCurrency = COUNTRY_CODE_TO_CURRENCY[defCountry] || 'INR'
          setCurrency(matchedCurrency)
          setAddress({
            firstName: defAddr.full_name?.split(' ')[0] || fName,
            lastName: defAddr.full_name?.split(' ').slice(1).join(' ') || lName,
            email: email,
            phone: defAddr.phone || ph,
            country: defCountry,
            street: defAddr.address_line1 || '',
            apartment: defAddr.address_line2 || '',
            city: defAddr.city || '',
            state: defAddr.state || '',
            zip: defAddr.postal_code || ''
          })
          updateTotals(shippingMethod, appliedCoupon?.code, defCountry)
        } else {
          setAddress(prev => ({
            ...prev,
            email: email,
            firstName: fName || prev.firstName,
            lastName: lName || prev.lastName,
            phone: ph || prev.phone
          }))
        }
      } else {
        setAddress(prev => ({ ...prev, email: email }))
      }
    } catch (err) {
      console.error('Error fetching customer details:', err)
      setAddress(prev => ({ ...prev, email: email }))
    }
  }

  // PIN auto-fill state
  const [pinLookupLoading, setPinLookupLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true)
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/checkout`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      })
      if (error) {
        setError(error.message)
        setGoogleLoading(false)
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err)
      setError(err.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

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

  // International Concierge States
  const [customNotes, setCustomNotes] = useState('')
  const [internationalSuccess, setInternationalSuccess] = useState<{
    orderNumber: string
    orderId: string
    whatsappUrl: string
    totalAmount: number
    currency: string
  } | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)

  const handleInternationalSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!address.firstName || !address.lastName || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
        throw new Error('Please fill in all required customer and shipping details.')
      }

      const inputItems: CartInputItem[] = items.map(item => ({
        productId: item.productId || item.id,
        variantId: item.variantId || null,
        quantity: item.quantity
      }))

      const res = await submitInternationalOrderRequest(
        address,
        inputItems,
        currency,
        customNotes,
        appliedCoupon?.code
      )

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit international order request.')
      }

      setInternationalSuccess({
        orderNumber: res.orderNumber!,
        orderId: res.orderId!,
        whatsappUrl: res.whatsappUrl!,
        totalAmount: res.totalAmount || totals.total,
        currency: res.currency || currency
      })

      await clearCart()
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your international request.')
    } finally {
      setLoading(false)
    }
  }

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
    } else if (!internationalSuccess) {
      router.push('/')
    }
  }, [items, internationalSuccess])

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

  if (!mounted || (items.length === 0 && !internationalSuccess)) return null

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

      if (address.country !== 'IN') {
        throw new Error('Online checkout is currently available exclusively within India. Please contact our concierge on WhatsApp for international inquiries.')
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
            {address.country !== 'IN' ? (
              <span className="text-[10px] lg:text-xs text-[#FF7A00] font-black uppercase tracking-wider bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-full">
                Calculated by Concierge
              </span>
            ) : totals.shipping === 0 ? (
              'FREE'
            ) : (
              <PriceDisplay amount={totals.shipping} />
            )}
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
          <dt className="text-lg lg:text-xl font-sans font-black uppercase tracking-tighter text-gray-900">
            {address.country !== 'IN' ? 'Items Total' : 'Total'}
          </dt>
          <dd className="text-xl lg:text-2xl font-black text-[#FF7A00] tracking-tight">
            <PriceDisplay amount={Math.max(0, totals.subtotal - totals.discount)} />
          </dd>
        </div>
        {address.country !== 'IN' && (
          <p className="text-[9px] lg:text-[10px] text-gray-400 font-semibold text-right -mt-2">
            *Express international courier fee will be calculated &amp; quoted by concierge
          </p>
        )}
      </dl>
    </div>
  )

  const inputClasses = "w-full bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl sm:rounded-2xl py-3 px-3.5 sm:py-3.5 sm:px-5 text-xs sm:text-sm font-medium text-gray-900 shadow-2xs outline-none transition-all placeholder:text-gray-400"

  // International Order Confirmation Screen
  if (internationalSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-16 px-4">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 p-6 sm:p-10 md:p-12 shadow-xl text-center space-y-8 relative overflow-hidden">
          {/* Decorative ambient glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5 text-[#FF7A00]" />
              International Concierge Order Request
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Request Received Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              Thank you, <strong className="text-gray-900">{address.firstName}</strong>. Your international order inquiry for <strong className="text-gray-900">{address.city}, {COUNTRIES.find(c => c.code === address.country)?.label || address.country}</strong> has been assigned to our senior concierge team.
            </p>
          </div>

          {/* Reference ID Pill */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md mx-auto">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Reference Number</p>
              <p className="text-base sm:text-lg font-black text-gray-900 tracking-wider">#{internationalSuccess.orderNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(internationalSuccess.orderNumber)
                setCopiedRef(true)
                setTimeout(() => setCopiedRef(false), 2000)
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#FF7A00] hover:border-[#FF7A00] transition-colors shadow-xs cursor-pointer"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRef ? 'Copied!' : 'Copy Ref'}</span>
            </button>
          </div>

          {/* WhatsApp Concierge Action Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Connect Directly on WhatsApp for Instant Quote
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Click below to start a direct chat with our concierge with your pre-filled order summary. We will immediately quote express DHL / FedEx courier charges and share your secure payment link.
                </p>
              </div>
            </div>

            <a
              href={internationalSuccess.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp with Ref #{internationalSuccess.orderNumber}</span>
            </a>
          </div>

          {/* Next Steps Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left space-y-4 shadow-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">What Happens Next?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Quote Prepared</span>
                </div>
                <p className="text-[11px] text-gray-500">We calculate exact DHL / FedEx discounted shipping to your postal code.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Payment Link</span>
                </div>
                <p className="text-[11px] text-gray-500">You receive a secure checkout link (Credit Cards / Stripe / PayPal / Wire).</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Express Dispatch</span>
                </div>
                <p className="text-[11px] text-gray-500">Crafted, quality inspected and dispatched with live tracking to your doorstep.</p>
              </div>
            </div>
          </div>

          {/* Return Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors cursor-pointer"
            >
              <span>Explore More Collections</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        
        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-5">
          <button 
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="w-full flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs focus:outline-none transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[#FF7A00] shrink-0">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
              <span>{isMobileSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isMobileSummaryOpen ? 'rotate-180' : ''}`} />
            </div>
            <span className="font-black text-base sm:text-lg text-gray-900"><PriceDisplay amount={totals.total} /></span>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${isMobileSummaryOpen ? 'max-h-[2500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
               {renderOrderSummary(true)}
            </div>
          </div>
        </div>

        {/* Main Checkout Flow */}
        <div className="lg:col-span-7">
          <div className="bg-white sm:bg-[#F8F9FA] rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 md:p-10 border border-gray-200/80 sm:border-gray-100 shadow-xs sm:shadow-none space-y-6 sm:space-y-10">

            {error && (
              <div className="bg-red-50 text-red-500 p-3.5 sm:p-4 rounded-xl text-xs tracking-widest uppercase font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            {/* STEP 1: Customer Details */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors shadow-xs ${step === 1 ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </span>
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900">
                    Customer &amp; Delivery Details
                  </h2>
                </div>

                {isGuestUser ? (
                  <div className="text-xs text-gray-500 font-medium flex items-center justify-between sm:justify-end pl-9 sm:pl-0">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpCardOpen(!isOtpCardOpen)
                        setOtpError(null)
                        setOtpMessage(null)
                      }}
                      className="text-[#FF7A00] font-bold hover:underline cursor-pointer ml-1.5"
                    >
                      {isOtpCardOpen ? 'Cancel' : 'Log in'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 w-fit ml-9 sm:ml-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="truncate max-w-[200px]">{currentUserEmail}</span>
                  </div>
                )}
              </div>

              {/* Minimal Inline OTP Sign-In Box (when opened) */}
              {isGuestUser && isOtpCardOpen && step === 1 && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-900">
                      {otpStep === 'email' && 'Sign in with an instant 4-digit code to auto-fill details'}
                      {otpStep === 'otp' && `Enter 4-digit code sent to ${otpEmailInput}`}
                      {otpStep === 'profile' && 'Complete your name & phone'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsOtpCardOpen(false)}
                      className="text-xs text-gray-400 hover:text-gray-700 font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {otpError && (
                    <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl font-medium border border-red-100">
                      {otpError}
                    </p>
                  )}
                  {otpMessage && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl font-medium border border-emerald-100">
                      {otpMessage}
                    </p>
                  )}

                  {/* Step 1: Email */}
                  {otpStep === 'email' && (
                    <form onSubmit={handleSendCheckoutOTP} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          defaultValue={address.email || ''}
                          placeholder="Enter your email address"
                          className="w-full sm:flex-1 bg-white border border-gray-300 focus:border-black rounded-xl px-4 py-3 text-xs font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-2xs"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={otpLoading}
                          className="w-full sm:w-auto bg-[#111111] hover:bg-[#FF7A00] text-white text-xs font-bold px-5 py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                        >
                          {otpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>{otpLoading ? 'Sending...' : 'Send Code'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 mt-2">
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Or</span>
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          disabled={googleLoading}
                          className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-white border border-gray-200 px-3.5 py-1.5 rounded-lg shadow-2xs"
                        >
                          {googleLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          )}
                          <span>Continue with Google</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 2: 4 Digits */}
                  {otpStep === 'otp' && (
                    <form onSubmit={handleVerifyCheckoutOTP} className="space-y-3.5">
                      <div className="flex items-center gap-2.5 max-w-[220px]">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={el => { otpInputRefs.current[idx] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleDigitChange(idx, e.target.value)}
                            onKeyDown={e => handleDigitKeyDown(idx, e)}
                            onPaste={handleDigitPaste}
                            className="w-11 h-12 text-center text-xl font-mono font-bold rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none bg-white text-gray-900 shadow-2xs transition-all"
                          />
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            disabled={otpLoading || otpDigits.join('').length !== 4}
                            className="bg-[#111111] hover:bg-[#FF7A00] text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                          >
                            {otpLoading ? 'Verifying...' : 'Verify & Log In'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpStep('email')}
                            className="text-xs text-gray-500 hover:text-black underline cursor-pointer font-medium"
                          >
                            Change
                          </button>
                        </div>

                        {otpResendCountdown > 0 ? (
                          <span className="text-[11px] text-gray-400 font-medium">Resend in {otpResendCountdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendCheckoutOTP}
                            disabled={otpIsResending}
                            className="text-xs text-[#FF7A00] font-bold hover:underline cursor-pointer"
                          >
                            {otpIsResending ? 'Sending...' : 'Resend Code'}
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Step 3: Complete Profile */}
                  {otpStep === 'profile' && (
                    <form onSubmit={handleCompleteCheckoutProfile} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input 
                          type="text" 
                          name="name" 
                          required 
                          value={otpName} 
                          onChange={e => setOtpName(e.target.value)} 
                          placeholder="Full name" 
                          className="bg-white border border-gray-300 focus:border-black rounded-xl px-4 py-3 text-xs outline-none font-medium shadow-2xs"
                          autoFocus
                        />
                        <input 
                          type="tel" 
                          name="phone" 
                          required 
                          value={otpPhone} 
                          onChange={e => setOtpPhone(e.target.value)} 
                          placeholder="Mobile number" 
                          className="bg-white border border-gray-300 focus:border-black rounded-xl px-4 py-3 text-xs outline-none font-medium shadow-2xs"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={otpLoading} 
                        className="w-full sm:w-auto bg-[#111111] hover:bg-[#FF7A00] text-white text-xs font-bold px-5 py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                      >
                        {otpLoading ? 'Saving...' : 'Save & Continue'}
                      </button>
                    </form>
                  )}
                </div>
              )}
              {step === 1 ? (
                <div className="space-y-6">
                  {/* Saved addresses (if logged-in) */}
                  {userAddresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Saved Addresses</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {userAddresses.map((sa: any) => {
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
                                  email: currentUserEmail || address.email,
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
                        onChange={e => setAddress({...address, phone: e.target.value})} 
                        placeholder="Phone number with country code" 
                        className={inputClasses} 
                      />
                    </div>

                    {/* Country/Region Dropdown */}
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
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
                      </select>
                    </div>

                    {/* International Shipping Notice Banner */}
                    {address.country !== 'IN' && (
                      <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 space-y-2.5 animate-in fade-in-50 duration-300">
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-[#FF7A00] shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider text-[#1C1C1C]">
                            Worldwide Express Delivery ({COUNTRIES.find(c => c.code === address.country)?.label || address.country})
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          We ship internationally via <strong>DHL Express &amp; FedEx Priority</strong>. Enter your destination details below and click <strong>&quot;Review International Order Request&quot;</strong> to review your items and submit your inquiry for an instant concierge quote.
                        </p>
                      </div>
                    )}

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
                            Auto-fetching city &amp; state...
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
                      type="button"
                      onClick={() => {
                        if (!address.firstName || !address.lastName || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
                          setError('Please fill in all required customer and shipping details')
                          return
                        }
                        setError(null)
                        setStep(2)
                      }}
                      className="w-full rounded-xl sm:rounded-full bg-[#1C1C1C] text-white py-3.5 sm:py-4.5 text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{address.country === 'IN' ? 'Continue to Delivery' : 'Review International Order Request →'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-gray-500 pl-0 sm:pl-11">
                  <p className="font-bold text-gray-900">{address.firstName} {address.lastName}</p>
                  <p className="font-medium mt-1">
                    {address.street}{address.apartment ? `, ${address.apartment}` : ''}, {address.city}, {address.state} {address.zip}, {COUNTRIES.find(c => c.code === address.country)?.label || address.country}
                  </p>
                  <p className="font-medium mt-1">{address.email} · {address.phone}</p>
                  <button 
                    type="button"
                    onClick={() => setStep(1)} 
                    className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#1C1C1C] transition-colors mt-3 cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Edit Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* DEDICATED INTERNATIONAL ORDER REVIEW & CONCIERGE FLOW (When country !== 'IN') */}
            {address.country !== 'IN' ? (
              <div className={`border-t border-gray-200 pt-6 sm:pt-10 ${step < 2 ? 'opacity-40 pointer-events-none grayscale' : 'transition-opacity duration-500'}`}>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs mr-3 sm:mr-4 transition-colors shadow-xs ${step === 2 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                  International Order Review &amp; Concierge Request
                </h2>

                {step === 2 && (
                  <div className="space-y-6 pl-0 sm:pl-11">
                    {/* Destination & Contact Summary Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 text-[#FF7A00]" />
                          Destination &amp; Contact Details
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00] hover:text-[#1C1C1C] transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <p className="font-bold text-gray-900 text-sm">{address.firstName} {address.lastName}</p>
                        <p>{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
                        <p>{address.city}, {address.state} {address.zip}, <span className="font-bold text-gray-900">{COUNTRIES.find(c => c.code === address.country)?.label || address.country}</span></p>
                        <p className="text-gray-500 font-medium pt-1">{address.email} · {address.phone}</p>
                      </div>
                    </div>

                    {/* Itemized Order Preview */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-xs">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block border-b border-gray-100 pb-3">
                        Items Requested ({items.length})
                      </span>
                      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                        {items.map((item) => (
                          <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider line-clamp-1">{item.name}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  Qty: {item.quantity} {item.size && `· Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-gray-900 shrink-0">
                              <PriceDisplay amount={(item.salePrice || item.price) * item.quantity} />
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary Breakdown */}
                      <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Items Subtotal</span>
                          <span className="font-bold text-gray-900"><PriceDisplay amount={totals.subtotal} /></span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-[#FF7A00]">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span className="font-bold">-<PriceDisplay amount={totals.discount} /></span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600 items-center pt-1">
                          <span>Express International Shipping</span>
                          <span className="font-black text-[#FF7A00] text-[10px] uppercase tracking-wider bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
                            Calculated by Concierge
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Notes / Fitting Instructions Input */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Bespoke Fitting Notes / Event Date / Custom Requests <span className="text-gray-400 normal-case font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={customNotes}
                        onChange={e => setCustomNotes(e.target.value)}
                        placeholder="e.g., Wedding date: Nov 15th, custom sleeve length requests, urgent delivery note..."
                        className="w-full bg-white border border-gray-300 focus:border-black rounded-xl p-3.5 text-xs font-medium text-gray-900 shadow-2xs outline-none transition-colors placeholder:text-gray-400"
                      />
                    </div>

                    {/* How Concierge Works */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#1C1C1C] uppercase tracking-wider text-[11px]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Zero Upfront Charge Today</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-600 font-medium">
                        Submitting this request will not charge your card right now. Our senior concierge will calculate discounted DHL / FedEx shipping rates to your exact postal code and share an official invoice with a 100% secure payment link via WhatsApp &amp; Email.
                      </p>
                    </div>

                    {/* Submit Request CTA */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleInternationalSubmit}
                        disabled={loading}
                        className="w-full rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 sm:py-5 text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          'Submitting Inquiry...'
                        ) : (
                          <>
                            <MessageCircle className="w-5 h-5" />
                            <span>Request Concierge Quote &amp; Delivery</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* DOMESTIC INDIA STEP 2: Shipping Method */}
                <div className={`border-t border-gray-200 pt-6 sm:pt-10 ${step < 2 ? 'opacity-40 pointer-events-none grayscale' : 'transition-opacity duration-500'}`}>
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs mr-3 sm:mr-4 transition-colors shadow-xs ${step === 2 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                    Shipping Method
                  </h2>
                  {step === 2 ? (
                    <div className="space-y-4 pl-0 sm:pl-11">
                      <label className="flex items-center justify-between p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-[#1C1C1C] bg-white cursor-pointer shadow-2xs">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            name="shipping" 
                            value="standard" 
                            checked={shippingMethod === 'standard'} 
                            onChange={() => {
                              setShippingMethod('standard')
                              updateTotals('standard', appliedCoupon?.code, address.country)
                            }} 
                            className="h-4 w-4 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-300" 
                          />
                          <div className="ml-3">
                            <span className="block text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
                              Standard Domestic Shipping
                            </span>
                            <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                              Estimated Delivery: 3–5 Business Days (Blue Dart / Delhivery Express)
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-gray-900 tracking-wide">
                          {totals.shipping === 0 ? 'FREE' : <PriceDisplay amount={totals.shipping} />}
                        </span>
                      </label>
                      
                      <div className="mt-6">
                        <button 
                          type="button"
                          onClick={() => {
                            setError(null)
                            setStep(3)
                          }}
                          className="w-full rounded-xl sm:rounded-full bg-[#1C1C1C] text-white py-3.5 sm:py-4.5 text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-md cursor-pointer"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  ) : step > 2 ? (
                    <div className="text-xs sm:text-sm text-gray-500 pl-0 sm:pl-11 flex justify-between items-center">
                      <p className="font-bold text-gray-900">
                        Standard Domestic Shipping (3-5 days)
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* DOMESTIC INDIA STEP 3: Payment */}
                <div className={`border-t border-gray-200 pt-6 sm:pt-10 ${step < 3 ? 'opacity-40 pointer-events-none grayscale' : 'transition-opacity duration-500'}`}>
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs mr-3 sm:mr-4 transition-colors shadow-xs ${step === 3 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
                    Payment Options
                  </h2>
                  {step === 3 && (
                    <div className="space-y-5 pl-0 sm:pl-11">
                      <div className="space-y-3.5">
                        {/* Primary Online Gateway (UPI, Cards, NetBanking) */}
                        <label 
                          onClick={() => setPaymentMethod('ONLINE')}
                          className={`flex items-start sm:items-center p-3.5 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'ONLINE' ? 'border-gray-900 bg-white ring-2 ring-black/5 shadow-2xs' : 'border-gray-200 bg-gray-50/60 hover:bg-white'}`}
                        >
                          <input 
                            type="radio" 
                            name="payment" 
                            value="ONLINE" 
                            checked={paymentMethod === 'ONLINE'} 
                            onChange={() => setPaymentMethod('ONLINE')}
                            className="h-4 w-4 text-black focus:ring-black border-gray-300 mt-0.5 sm:mt-0 shrink-0" 
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="block text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider leading-tight">
                                Instant Online Payment
                              </span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                100% Secure
                              </span>
                            </div>
                            <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-1">
                              UPI (GPay / PhonePe / Paytm), Credit &amp; Debit Cards, NetBanking &amp; International Cards.
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">UPI</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Cards</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded">NetBanking</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 rounded">International</span>
                            </div>
                          </div>
                        </label>

                        {/* Secondary COD (Only if enabled in admin) */}
                        {codEnabled && (
                          <label 
                            onClick={() => setPaymentMethod('COD')}
                            className={`flex items-start sm:items-center p-3.5 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'COD' ? 'border-gray-900 bg-white ring-2 ring-black/5 shadow-2xs' : 'border-gray-200 bg-gray-50/60 hover:bg-white'}`}
                          >
                            <input 
                              type="radio" 
                              name="payment" 
                              value="COD" 
                              checked={paymentMethod === 'COD'} 
                              onChange={() => setPaymentMethod('COD')}
                              className="h-4 w-4 text-black focus:ring-black border-gray-300 mt-0.5 sm:mt-0 shrink-0" 
                            />
                            <div className="ml-3 flex-1">
                              <span className="block text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider leading-tight">
                                Cash on Delivery (COD)
                              </span>
                              <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                                Pay in cash upon delivery of your order at your doorstep.
                              </span>
                            </div>
                          </label>
                        )}
                      </div>

                      <div className="mt-6">
                        <button 
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className="w-full rounded-xl sm:rounded-full bg-[#111111] hover:bg-[#FF7A00] text-white py-4 sm:py-5 text-xs sm:text-sm font-black uppercase tracking-widest transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
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
              </>
            )}

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
