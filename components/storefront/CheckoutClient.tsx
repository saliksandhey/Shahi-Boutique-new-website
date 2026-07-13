'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'
import { calculateOrderTotal, createRazorpayOrderAction, verifyAndCreateOrder, createCODOrderAction, getPublicCoupons } from '@/lib/actions/checkout'
import { saveAddress } from '@/lib/actions/address'
import Script from 'next/script'
import { Ticket, X, Gift, ShoppingCart, ChevronDown } from 'lucide-react'

export function CheckoutClient({ 
  codEnabled, 
  razorpayKeyId,
  savedAddresses = [],
  userEmail
}: { 
  codEnabled: boolean, 
  razorpayKeyId: string,
  savedAddresses?: any[],
  userEmail: string
}) {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultAddress = savedAddresses.find((a: any) => a.is_default) || savedAddresses[0] || null
  
  // Order State
  const [address, setAddress] = useState({
    firstName: defaultAddress?.full_name?.split(' ')[0] || '',
    lastName: defaultAddress?.full_name?.split(' ').slice(1).join(' ') || '',
    email: userEmail || '',
    phone: defaultAddress?.phone || '',
    street: defaultAddress?.address_line1 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    zip: defaultAddress?.postal_code || '',
    country: defaultAddress?.country || 'US'
  })
  const [shippingMethod, setShippingMethod] = useState('standard') // only standard now
  const [paymentMethod, setPaymentMethod] = useState('razorpay') // razorpay | cod
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, isFreeGift?: boolean} | null>(null)

  // New Address State
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  })

  // Live Totals (fetched from server)
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, discount: 0, total: 0 })
  
  // Public Coupons
  const [publicCoupons, setPublicCoupons] = useState<any[]>([])
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)

  // Mobile Order Summary Toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (items.length > 0) {
      updateTotals()
      getPublicCoupons().then(coupons => setPublicCoupons(coupons))
    } else {
      router.push('/')
    }
  }, [items])

  const updateTotals = async (currentShipping = shippingMethod, currentCoupon = appliedCoupon?.code) => {
    try {
      const inputItems = items.map(i => ({ productId: i.productId || i.id, variantId: i.variantId, quantity: i.quantity }))
      const result = await calculateOrderTotal(inputItems, currentShipping, currentCoupon)
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

  // Effect to recalculate when shipping changes
  useEffect(() => {
    if (mounted && items.length > 0) {
      updateTotals(shippingMethod)
    }
  }, [shippingMethod])

  if (!mounted || items.length === 0) return null

  const handleApplyCoupon = async (codeToApply?: string) => {
    setError(null)
    const code = codeToApply || couponCode
    try {
      const inputItems = items.map(i => ({ productId: i.productId || i.id, variantId: i.variantId, quantity: i.quantity }))
      const result = await calculateOrderTotal(inputItems, shippingMethod, code)
      if (result.couponApplied) {
        setAppliedCoupon({ code: code, discount: result.discount, isFreeGift: result.isFreeGift })
        setTotals({ subtotal: result.subtotal, shipping: result.shipping, discount: result.discount, total: result.total })
        if (codeToApply) setCouponCode(codeToApply)
      } else {
        // Find if this was a public coupon failing the min amount
        const pc = publicCoupons.find(c => c.code === code)
        if (pc && totals.subtotal < pc.min_order_amount) {
          setError(`Add ₹${(pc.min_order_amount - totals.subtotal).toFixed(2)} more to unlock this coupon`)
        } else {
          setError('Invalid or expired coupon')
        }
        setAppliedCoupon(null)
      }
    } catch (e: any) {
      setError(e.message || 'Error applying coupon')
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError(null)
    const inputItems = items.map(i => ({ productId: i.productId || i.id, variantId: i.variantId, quantity: i.quantity }))

    try {
      if (paymentMethod === 'cod') {
        const res = await createCODOrderAction(address, inputItems, shippingMethod, appliedCoupon?.code)
        if (res.success && 'orderId' in res) {
          await clearCart()
          router.push(`/checkout/success?order_id=${res.orderId}`)
        } else {
          setError('error' in res ? res.error : 'Failed to process COD order')
          setLoading(false)
        }
      } else {
        // Razorpay Flow
        if (!razorpayKeyId) {
          throw new Error('Razorpay is not configured. Please contact support.')
        }

        const orderRes = await createRazorpayOrderAction(inputItems, shippingMethod, appliedCoupon?.code)
        if (!orderRes.success) {
          throw new Error(orderRes.error || 'Failed to initialize payment')
        }

        const options = {
          key: razorpayKeyId,
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: "SHAHI Boutique",
          description: "Order Payment",
          order_id: orderRes.orderId,
          handler: async function (response: any) {
            setLoading(true)
            const verifyRes = await verifyAndCreateOrder(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              address,
              inputItems,
              shippingMethod,
              appliedCoupon?.code
            )
            
            if (verifyRes.success && 'orderId' in verifyRes) {
              await clearCart()
              router.push(`/checkout/success?order_id=${verifyRes.orderId}`)
            } else {
              setError('error' in verifyRes ? verifyRes.error : 'Payment verification failed. Please contact support.')
              setLoading(false)
            }
          },
          prefill: {
            name: `${address.firstName} ${address.lastName}`,
            email: address.email,
            contact: address.phone
          },
          theme: {
            color: "#FF7A00"
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          setError(response.error.description || 'Payment failed')
          setLoading(false)
        })
        
        rzp.open()
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
                <p className="text-xs lg:text-sm font-black text-[#FF7A00] tracking-wide">₹{((item.salePrice || item.price) * item.quantity).toFixed(2)}</p>
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

      <dl className="space-y-4 lg:space-y-6 text-xs lg:text-sm border-t border-gray-200 pt-6 lg:pt-8">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 font-bold tracking-widest uppercase text-[10px] lg:text-xs">Subtotal</dt>
          <dd className="font-black text-gray-900 tracking-wide">₹{totals.subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 font-bold tracking-widest uppercase text-[10px] lg:text-xs">Shipping</dt>
          <dd className="font-black text-gray-900 tracking-wide">{totals.shipping === 0 ? 'FREE' : `₹${totals.shipping.toFixed(2)}`}</dd>
        </div>
        {appliedCoupon && (
          <div className="flex items-center justify-between text-[#FF7A00]">
            <dt className="font-bold tracking-widest uppercase text-[10px] lg:text-xs">
              {appliedCoupon.isFreeGift ? `Free Gift (${appliedCoupon.code})` : `Discount (${appliedCoupon.code})`}
            </dt>
            <dd className="font-black tracking-wide">
              {appliedCoupon.isFreeGift ? 'FREE' : `-₹${totals.discount.toFixed(2)}`}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 lg:pt-6 mt-4 lg:mt-6">
          <dt className="text-lg lg:text-xl font-sans font-black uppercase tracking-tighter text-gray-900">Total</dt>
          <dd className="text-xl lg:text-2xl font-black text-[#FF7A00] tracking-tight">₹{totals.total.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  )

  const inputClasses = "w-full bg-white border border-gray-200 focus:border-[#FF7A00] focus:ring-0 rounded-full py-3 px-5 md:py-4 md:px-6 text-xs md:text-sm font-bold text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 placeholder:font-medium"

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
            <span className="font-black text-lg text-[#FF7A00]">₹{totals.total.toFixed(2)}</span>
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
            
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs tracking-widest uppercase font-bold text-center">
                {error}
              </div>
            )}

            {/* STEP 1: Address */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs mr-4 transition-colors shadow-sm ${step === 1 ? 'bg-[#1C1C1C] text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                Shipping Address
              </h2>
              {step === 1 ? (
                <div>
                  {savedAddresses.length > 0 ? (
                    <>
                    <div className="mb-8">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Select a saved address</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedAddresses.map((sa: any) => {
                          const isSelected = address.street === sa.address_line1 && address.city === sa.city;
                          return (
                            <div 
                              key={sa.id} 
                              onClick={() => setAddress({
                                firstName: sa.full_name?.split(' ')[0] || '',
                                lastName: sa.full_name?.split(' ').slice(1).join(' ') || '',
                                email: userEmail || '',
                                phone: sa.phone || '',
                                street: sa.address_line1 || '',
                                city: sa.city || '',
                                state: sa.state || '',
                                zip: sa.postal_code || '',
                                country: sa.country || 'US'
                              })}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${isSelected ? 'border-[#1C1C1C] bg-gray-50 ring-1 ring-[#1C1C1C]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-xs text-gray-900 uppercase tracking-widest">{sa.full_name}</p>
                                {sa.is_default && <span className="text-[8px] bg-black text-white px-2 py-1 rounded-sm uppercase tracking-widest">Default</span>}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 font-medium">{sa.address_line1}</p>
                              <p className="text-[10px] text-gray-500 font-medium">{sa.city}, {sa.state} {sa.postal_code}</p>
                            </div>
                          )
                        })}
                      </div>
                      </div>
                      
                      {/* Add New Address Toggle */}
                      {!showNewAddressForm && (
                        <div className="mt-6 flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => setShowNewAddressForm(true)}
                            className="text-xs font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#1C1C1C] transition-colors border-b-2 border-transparent hover:border-[#1C1C1C]"
                          >
                            + Add New Address
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                      <p className="text-xs font-medium text-gray-500 mb-4">You don't have any saved addresses yet.</p>
                      {!showNewAddressForm && (
                        <button 
                          type="button"
                          onClick={() => setShowNewAddressForm(true)}
                          className="bg-[#1C1C1C] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors shadow-sm"
                        >
                          Add New Address
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* New Address Form */}
                  {showNewAddressForm && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 mt-2">
                      <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4">Add a new address</h3>
                      <form action={async (formData) => {
                        setIsSavingAddress(true)
                        formData.append('full_name', `${newAddress.firstName} ${newAddress.lastName}`)
                        formData.append('address_line1', newAddress.street)
                        formData.append('postal_code', newAddress.zip)
                        formData.append('country', 'US')
                        const res = await saveAddress(formData)
                        if (res.success) {
                          setShowNewAddressForm(false)
                          setNewAddress({ firstName: '', lastName: '', phone: '', street: '', city: '', state: '', zip: '' })
                          // Assuming the parent page will refresh the savedAddresses array via revalidatePath
                        } else {
                          setError(res.error || 'Failed to save address')
                        }
                        setIsSavingAddress(false)
                      }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input required type="text" name="firstName" placeholder="First Name" value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} className={inputClasses} />
                        <input required type="text" name="lastName" placeholder="Last Name" value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} className={inputClasses} />
                        <input required type="tel" name="phone" placeholder="10-digit Phone Number" maxLength={10} value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g, '')})} className={`${inputClasses} sm:col-span-2`} />
                        <input required type="text" name="street" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className={`${inputClasses} sm:col-span-2`} />
                        <input required type="text" name="city" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className={inputClasses} />
                        <input required type="text" name="state" placeholder="State/Province" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className={inputClasses} />
                        <input required type="text" name="zip" placeholder="Zip / Postal Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className={`${inputClasses} sm:col-span-2`} />
                        
                        <div className="sm:col-span-2 flex gap-4 mt-2">
                          <button type="button" onClick={() => setShowNewAddressForm(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                          <button type="submit" disabled={isSavingAddress} className="flex-1 rounded-full bg-[#1C1C1C] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors disabled:opacity-50">
                            {isSavingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!address.street || !address.city || showNewAddressForm}
                      className="w-full rounded-full bg-[#1C1C1C] text-white py-4 md:py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 shadow-md"
                    >
                      {(!address.street || !address.city) ? 'Select an address to continue' : 'Continue to Delivery'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 pl-12">
                  <p className="font-bold text-gray-900">{address.firstName} {address.lastName}</p>
                  <p className="font-medium mt-1">{address.street}, {address.city}, {address.state} {address.zip}</p>
                  <p className="font-medium mt-1">{address.email} | +91 {address.phone}</p>
                  <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#1C1C1C] transition-colors mt-4">Edit Address</button>
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
                <div className="space-y-4 pl-0 md:pl-12">
                  <label className="flex items-center justify-between p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-[#FF7A00] bg-white ring-4 ring-[#FF7A00]/10">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-[5px] border-[#FF7A00] bg-white"></div>
                      <div className="ml-4">
                        <span className="block text-sm font-bold text-gray-900 uppercase tracking-widest">Standard Shipping</span>
                        <span className="block text-xs text-gray-500 font-medium mt-1">4-6 business days</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 tracking-wide">{totals.subtotal > 150 ? 'FREE' : '₹10.00'}</span>
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
                <div className="text-sm text-gray-500 pl-12 flex justify-between items-center">
                  <p className="font-bold text-gray-900">Standard Shipping (4-6 days)</p>
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
                <div className="space-y-8 md:space-y-10 pl-0 md:pl-12">
                  
                  {/* Coupon section */}
                  <div className="space-y-6 border-b border-gray-100 pb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        placeholder="Gift card or discount code" 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value)} 
                        disabled={!!appliedCoupon}
                        className="flex-1 bg-white border border-gray-200 focus:border-[#FF7A00] focus:ring-0 rounded-full py-4 px-6 text-sm font-bold text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 placeholder:font-medium disabled:opacity-50 uppercase placeholder:normal-case" 
                      />
                      <button 
                        type="button" 
                        onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(''); updateTotals(shippingMethod, undefined) } : () => handleApplyCoupon()}
                        className="bg-[#1C1C1C] text-white rounded-full px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors duration-300 shadow-sm whitespace-nowrap"
                      >
                        {appliedCoupon ? 'Remove' : 'Apply'}
                      </button>
                    </div>

                    {/* Available Public Coupons Button */}
                    {publicCoupons.length > 0 && !appliedCoupon && (
                      <button 
                        type="button" 
                        onClick={() => setIsCouponModalOpen(true)}
                        className="mt-4 flex items-center justify-between w-full p-4 border border-[#FF7A00]/30 bg-[#FF7A00]/5 rounded-2xl hover:bg-[#FF7A00]/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Ticket className="w-5 h-5 text-[#FF7A00] group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-900">View Available Offers</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
                          {publicCoupons.length} Offers
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <label className={`flex items-center p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'razorpay' ? 'border-2 border-[#FF7A00] bg-white ring-4 ring-[#FF7A00]/10' : 'border border-gray-200 bg-white hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="h-5 w-5 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-300 bg-transparent shrink-0" />
                      <div className="ml-3 md:ml-4">
                        <span className="block text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest leading-tight">Pay Online (Razorpay)</span>
                        <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Credit Card, UPI, NetBanking</span>
                      </div>
                    </label>

                    {codEnabled && (
                      <label className={`flex items-center p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-2 border-[#FF7A00] bg-white ring-4 ring-[#FF7A00]/10' : 'border border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-5 w-5 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-300 bg-transparent shrink-0" />
                        <div className="ml-3 md:ml-4">
                          <span className="block text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest leading-tight">Cash on Delivery</span>
                          <span className="block text-[10px] sm:text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Pay when you receive the order</span>
                        </div>
                      </label>
                    )}
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full rounded-full bg-[#FF7A00] text-white py-5 md:py-6 text-xs md:text-sm font-black uppercase tracking-widest hover:bg-[#1C1C1C] transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl"
                    >
                      {loading ? 'Processing...' : `Pay ₹${totals.total.toFixed(2)}`}
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
                          : `FLAT ₹${coupon.discount_value} OFF`}
                    </span>
                    
                    {coupon.min_order_amount > 0 && (
                      <span className="text-[10px] text-gray-500 font-medium mt-1">
                        On orders above ₹{coupon.min_order_amount}
                      </span>
                    )}

                    {isLocked && (
                      <span className="text-[10px] text-red-500 font-bold mt-4 uppercase tracking-wide flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg w-full">
                        Add ₹{(coupon.min_order_amount - totals.subtotal).toFixed(2)} more to unlock
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
