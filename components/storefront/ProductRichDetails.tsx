'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Package, Truck, RotateCcw, ShieldCheck, 
  Ruler, Palette, Scissors, Gift, Box, Clock, Check, 
  ChevronDown, Feather, HeartHandshake, Info,
  BadgeCheck, Award
} from 'lucide-react'

interface ProductRichDetailsProps {
  product: any
}

export function ProductRichDetails({ product }: ProductRichDetailsProps) {
  // All sections closed by default for clean initial view
  const [activeSection, setActiveSection] = useState<string>('')

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? '' : section)
  }
  
  const attr = product.attributes || {}
  
  // Extract values with robust fallback to attributes JSON and defaults
  const productType = product.product_type || attr.product_type || 'Handcrafted Potli'
  const craft = product.craft || attr.craft || '100% Artisan Handcrafted in India'
  const occasion = product.occasion || attr.occasion || 'Wedding / Festive / Party / Gifting'
  const fabric = product.fabric || attr.fabric || product.material || 'Pure Micro Velvet'
  const material = product.material || attr.material || 'Velvet, Satin Lining, Zari & Pearl Beads'
  const color = product.color || attr.color || null
  const work = product.work || attr.work || 'Hand Zari Embroidery, Pearl Beads & Sequins'
  const closure = product.closure || attr.closure || 'Drawstring with Handcrafted Latkans'
  const handle = product.handle || attr.handle || 'Embroidered Wristlet Loop Handle'
  const ageGroup = product.age_group || attr.age_group || null
  const countryOfOrigin = product.country_of_origin || 'India'
  const sku = product.sku || attr.sku || null

  // Dimensions
  const heightCm = product.height_cm || attr.height_cm || null
  const lengthCm = product.length_cm || attr.length_cm || null
  const weight = product.weight || attr.weight || null
  const dimensions = product.dimensions || attr.dimensions || null

  // Shipping
  const processingTime = product.processing_time || attr.processing_time || '1–2 Business Days'
  const estimatedDelivery = product.estimated_delivery || attr.estimated_delivery || '4–7 Business Days across India'
  const shippingAvailability = product.shipping_availability || attr.shipping_availability || 'In Stock — Ready to Dispatch'
  const freeShippingThreshold = product.free_shipping_threshold || attr.free_shipping_threshold || 'Free Standard Shipping on all Prepaid Orders'
  const internationalShipping = product.international_shipping || attr.international_shipping || 'Available worldwide via WhatsApp Concierge'
  const packageIncludes = product.package_includes || attr.package_includes || '1x Handcrafted Potli Bag, 1x Luxury Satin Dust Bag, 1x Care Guide'
  const packagingType = product.packaging_type || attr.packaging_type || 'Signature Rigid Luxury Gift Box with Satin Ribbon Wrap'

  // Returns & Guarantee
  const returnPolicy = product.return_policy || attr.return_policy || '7 Days Hassle-Free Returns on eligible items'
  const exchangePolicy = product.exchange_policy || attr.exchange_policy || '7 Days Easy Exchange for alternate style or color'
  const damagedPolicy = product.damaged_policy || attr.damaged_policy || '100% Free Replacement or Full Refund on items damaged in transit (Unboxing video recommended)'
  const returnWindow = product.return_window || attr.return_window || '7 Days from delivery date'
  const personalizedPolicy = product.personalized_policy || attr.personalized_policy || 'Customized / Monogrammed orders are non-returnable unless defective'

  // Care
  const careInstructions = product.care_instructions || '• Keep away from moisture, direct water splashes, and high humidity.\n• Store in the provided breathable dust bag or luxury box when not in use.\n• Avoid direct contact with perfumes, deodorants, or chemical sprays.\n• Spot clean gently with a soft dry cloth; Professional Dry Clean Only.'
  const careBullets = careInstructions.split('\n').filter(Boolean).map((line: string) => line.replace(/^[•\-\*]\s*/, '').trim())

  return (
    <div className="space-y-3 sm:space-y-3.5 pt-3.5 sm:pt-4 border-t border-gray-100">
      
      {/* 1. Quick Trust Badges Strip (Clean 3 Columns) */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100 text-center">
        <div className="flex flex-col items-center justify-center p-1">
          <Truck className="w-4 h-4 text-[#FF7A00] mb-1 stroke-[1.5]" />
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-900 leading-tight">Free Shipping</span>
          <span className="text-[8px] text-gray-400 font-medium hidden sm:block">Prepaid Orders</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 border-x border-gray-200/70">
          <RotateCcw className="w-4 h-4 text-[#FF7A00] mb-1 stroke-[1.5]" />
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-900 leading-tight">7-Day Return</span>
          <span className="text-[8px] text-gray-400 font-medium hidden sm:block">Easy Exchange</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1">
          <Sparkles className="w-4 h-4 text-[#FF7A00] mb-1 stroke-[1.5]" />
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-900 leading-tight">Handcrafted</span>
          <span className="text-[8px] text-gray-400 font-medium hidden sm:block">Artisan Quality</span>
        </div>
      </div>

      {/* 2. Compact Smooth Animated Accordions */}
      <div className="space-y-2 sm:space-y-2.5">
        
        {/* ACCORDION 1: SPECIFICATIONS & ARTISTRY */}
        <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          activeSection === 'specs' 
            ? 'border-[#FF7A00]/40 bg-white shadow-xs ring-1 ring-[#FF7A00]/10' 
            : 'border-gray-200/70 bg-white hover:border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('specs')}
            className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'specs' ? 'bg-[#FF7A00] text-white' : 'bg-purple-50 text-purple-700'
              }`}>
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-900">Product Specifications</h3>
                <p className="text-[8px] sm:text-[9px] font-medium text-gray-400">Fabric, work, closure &amp; dimensions</p>
              </div>
            </div>
            <motion.div 
              animate={{ rotate: activeSection === 'specs' ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'specs' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {activeSection === 'specs' && (
              <motion.div
                key="specs-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 border-t border-gray-100 space-y-2.5 sm:space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                    {product.categories && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Category</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{product.categories.name}</span>
                      </div>
                    )}
                    {sku && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">SKU</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{sku}</span>
                      </div>
                    )}
                    {productType && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Type</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{productType}</span>
                      </div>
                    )}
                    {craft && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Craft</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{craft}</span>
                      </div>
                    )}
                    {fabric && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Fabric</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{fabric}</span>
                      </div>
                    )}
                    {material && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Lining</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{material}</span>
                      </div>
                    )}
                    {work && (
                      <div className="flex justify-between py-1 border-b border-gray-100 sm:col-span-2">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Work</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{work}</span>
                      </div>
                    )}
                    {closure && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Closure</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{closure}</span>
                      </div>
                    )}
                    {handle && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Handle</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{handle}</span>
                      </div>
                    )}
                    {occasion && (
                      <div className="flex justify-between py-1 border-b border-gray-100 sm:col-span-2">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Occasion</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{occasion}</span>
                      </div>
                    )}
                    {countryOfOrigin && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Origin</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{countryOfOrigin}</span>
                      </div>
                    )}
                    {ageGroup && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px] sm:text-[9px]">Age Group</span>
                        <span className="font-semibold text-gray-900 text-right text-[10px] sm:text-[11px]">{ageGroup}</span>
                      </div>
                    )}
                  </div>

                  {/* Visual Dimensions Grid */}
                  {(heightCm || lengthCm || weight || dimensions) && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#F8F9FA] border border-gray-100 mt-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Ruler className="w-3.5 h-3.5 text-[#FF7A00]" />
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-900">Dimensions &amp; Weight</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                        {heightCm && (
                          <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                            <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Height</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-gray-900">{heightCm} cm</span>
                          </div>
                        )}
                        {lengthCm && (
                          <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                            <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Length</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-gray-900">{lengthCm} cm</span>
                          </div>
                        )}
                        {weight && (
                          <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                            <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Weight</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-gray-900">{weight}g</span>
                          </div>
                        )}
                        {dimensions && (
                          <div className="p-1.5 bg-white rounded-lg border border-gray-100 col-span-2 sm:col-span-1">
                            <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Profile</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-900 line-clamp-1">{dimensions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ACCORDION 2: SHIPPING & PACKAGING */}
        <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          activeSection === 'shipping' 
            ? 'border-[#FF7A00]/40 bg-white shadow-xs ring-1 ring-[#FF7A00]/10' 
            : 'border-gray-200/70 bg-white hover:border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('shipping')}
            className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'shipping' ? 'bg-[#FF7A00] text-white' : 'bg-orange-50 text-[#FF7A00]'
              }`}>
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-900">Shipping & Delivery</h3>
                <p className="text-[8px] sm:text-[9px] font-medium text-gray-400">Dispatch timeline, gift packaging &amp; delivery</p>
              </div>
            </div>
            <motion.div 
              animate={{ rotate: activeSection === 'shipping' ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'shipping' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {activeSection === 'shipping' && (
              <motion.div
                key="shipping-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 border-t border-gray-100 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Processing</span>
                      <p className="font-bold text-gray-900 text-[10px] sm:text-[11px]">{processingTime}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Estimated Delivery</span>
                      <p className="font-bold text-gray-900 text-[10px] sm:text-[11px]">{estimatedDelivery}</p>
                    </div>
                  </div>

                  {packagingType && (
                    <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Box className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Packaging Presentation</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-[10px] sm:text-[11px]">{packagingType}</p>
                    </div>
                  )}

                  {packageIncludes && (
                    <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Gift className="w-3.5 h-3.5 text-[#FF7A00]" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Package Includes</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-[10px] sm:text-[11px]">{packageIncludes}</p>
                    </div>
                  )}

                  {internationalShipping && (
                    <div className="p-2 bg-orange-50/40 rounded-xl border border-orange-100 text-[9px] sm:text-[10px] text-gray-700 font-medium flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                      <span><strong>International:</strong> {internationalShipping}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ACCORDION 3: RETURNS & EXCHANGE GUARANTEE */}
        <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          activeSection === 'returns' 
            ? 'border-[#FF7A00]/40 bg-white shadow-xs ring-1 ring-[#FF7A00]/10' 
            : 'border-gray-200/70 bg-white hover:border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('returns')}
            className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'returns' ? 'bg-[#FF7A00] text-white' : 'bg-teal-50 text-teal-700'
              }`}>
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-900">Returns & Guarantee</h3>
                <p className="text-[8px] sm:text-[9px] font-medium text-gray-400">{returnWindow} return policy &amp; damage guarantee</p>
              </div>
            </div>
            <motion.div 
              animate={{ rotate: activeSection === 'returns' ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'returns' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {activeSection === 'returns' && (
              <motion.div
                key="returns-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 border-t border-gray-100 space-y-2 text-xs">
                  <div className="p-2 sm:p-2.5 bg-teal-50/40 rounded-xl border border-teal-100 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-900">{returnWindow} Guarantee</h4>
                      <p className="text-gray-600 text-[10px] sm:text-[11px] mt-0.5 font-medium">{returnPolicy}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Exchange Policy</span>
                      <p className="font-semibold text-gray-900 text-[10px] sm:text-[11px]">{exchangePolicy}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Damage Protection</span>
                      <p className="font-semibold text-gray-900 text-[10px] sm:text-[11px]">{damagedPolicy}</p>
                    </div>
                  </div>

                  {personalizedPolicy && (
                    <p className="text-[9px] sm:text-[10px] text-gray-500 italic px-1">
                      * Note: {personalizedPolicy}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ACCORDION 4: CARE GUIDE */}
        <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          activeSection === 'care' 
            ? 'border-[#FF7A00]/40 bg-white shadow-xs ring-1 ring-[#FF7A00]/10' 
            : 'border-gray-200/70 bg-white hover:border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => toggleSection('care')}
            className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'care' ? 'bg-[#FF7A00] text-white' : 'bg-indigo-50 text-indigo-700'
              }`}>
                <Feather className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-900">Care & Preservation</h3>
                <p className="text-[8px] sm:text-[9px] font-medium text-gray-400">Maintain velvet luster &amp; hand embroidery</p>
              </div>
            </div>
            <motion.div 
              animate={{ rotate: activeSection === 'care' ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'care' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {activeSection === 'care' && (
              <motion.div
                key="care-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 border-t border-gray-100 space-y-1.5">
                  {careBullets.map((bullet: string, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-orange-100 text-[#FF7A00] flex items-center justify-center shrink-0 font-black text-[8px] mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-medium text-gray-700 leading-relaxed">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  )
}
