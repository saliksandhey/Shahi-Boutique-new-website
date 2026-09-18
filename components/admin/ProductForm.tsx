'use client'

import { useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { saveProductDetails, ProductPayload, uploadProductImages } from '@/lib/actions/admin-products'
import { 
  Upload, X, Sparkles, Package, Truck, RotateCcw, 
  ShieldCheck, Ruler, Palette, Tag, Check, Info, 
  Gift, Box, Clock, Globe, Eye, HeartHandshake,
  Percent, ChevronDown, ChevronUp, Layers, HelpCircle
} from 'lucide-react'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  category_id: z.string().optional().nullable(),
  product_type: z.string().optional(),
  sku: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK']).optional(),
  featured: z.boolean().optional(),
  is_enquiry_only: z.boolean().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),

  // Pricing & Inventory
  price: z.any(), // Regular / MRP
  sale_price: z.any(), // Selling price
  stock: z.any(),
  price_cad: z.any().optional(),
  sale_price_cad: z.any().optional(),
  price_aud: z.any().optional(),
  sale_price_aud: z.any().optional(),
  price_nzd: z.any().optional(),
  sale_price_nzd: z.any().optional(),
  price_usd: z.any().optional(),
  sale_price_usd: z.any().optional(),

  // Dimensions & Specs
  age_group: z.string().optional(),
  height_cm: z.any().optional(),
  length_cm: z.any().optional(),
  weight: z.any().optional(),
  dimensions: z.string().optional(),

  // Product Details & Craftsmanship
  fabric: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  work: z.string().optional(),
  closure: z.string().optional(),
  handle: z.string().optional(),
  craft: z.string().optional(),
  occasion: z.string().optional(),
  country_of_origin: z.string().optional(),

  // Shipping Details
  processing_time: z.string().optional(),
  estimated_delivery: z.string().optional(),
  shipping_availability: z.string().optional(),
  free_shipping_threshold: z.string().optional(),
  international_shipping: z.string().optional(),
  package_includes: z.string().optional(),
  packaging_type: z.string().optional(),

  // Returns & Exchange
  return_policy: z.string().optional(),
  exchange_policy: z.string().optional(),
  damaged_policy: z.string().optional(),
  return_window: z.string().optional(),
  personalized_policy: z.string().optional(),

  // Care Instructions
  care_instructions: z.string().optional(),

  // SEO
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  og_image: z.string().optional(),
  keywords: z.string().optional(),
  canonical_url: z.string().optional()
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm({ product, categories, mode }: { product?: any, categories: any[], mode?: 'regular' | 'enquiry' | null }) {
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<{file: File, preview: string}[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showGlobalPricing, setShowGlobalPricing] = useState(false)
  const [previewTab, setPreviewTab] = useState<'card' | 'details' | 'shipping' | 'returns' | 'care'>('card')
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  
  const isEnquiryMode = mode === 'enquiry' || (product && product.is_enquiry_only)
  const attributes = product?.attributes || {}
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name || '',
      slug: product.slug || '',
      category_id: product.category_id || '',
      product_type: product.product_type || attributes.product_type || '',
      sku: product.sku || attributes.sku || '',
      status: product.status || 'DRAFT',
      featured: product.featured || false,
      is_enquiry_only: isEnquiryMode,
      short_description: product.short_description || '',
      description: product.description || '',

      // Pricing & Inventory
      price: product.price ?? 0,
      sale_price: product.sale_price ?? '',
      stock: product.stock ?? 0,
      price_cad: product.price_cad ?? '',
      sale_price_cad: product.sale_price_cad ?? '',
      price_aud: product.price_aud ?? '',
      sale_price_aud: product.sale_price_aud ?? '',
      price_nzd: product.price_nzd ?? '',
      sale_price_nzd: product.sale_price_nzd ?? '',
      price_usd: product.price_usd ?? '',
      sale_price_usd: product.sale_price_usd ?? '',

      // Dimensions
      age_group: product.age_group || attributes.age_group || '',
      height_cm: product.height_cm ?? '',
      length_cm: product.length_cm ?? '',
      weight: product.weight ?? '',
      dimensions: product.dimensions || '',

      // Product Details
      fabric: product.fabric || '',
      material: product.material || '',
      color: product.color || attributes.color || '',
      work: product.work || attributes.work || '',
      closure: product.closure || attributes.closure || '',
      handle: product.handle || attributes.handle || '',
      craft: product.craft || attributes.craft || '100% Handcrafted by Artisans',
      occasion: product.occasion || attributes.occasion || 'Wedding / Festive / Party / Gifting',
      country_of_origin: product.country_of_origin || 'India',

      // Shipping Details
      processing_time: product.processing_time || attributes.processing_time || '1–2 Business Days',
      estimated_delivery: product.estimated_delivery || attributes.estimated_delivery || '4–7 Business Days across India',
      shipping_availability: product.shipping_availability || attributes.shipping_availability || 'In Stock — Ready to Dispatch',
      free_shipping_threshold: product.free_shipping_threshold || attributes.free_shipping_threshold || 'Free Standard Shipping on all Prepaid Orders',
      international_shipping: product.international_shipping || attributes.international_shipping || 'Available worldwide via WhatsApp Concierge',
      package_includes: product.package_includes || attributes.package_includes || '1x Handcrafted Potli Bag, 1x Luxury Satin Dust Bag, 1x Care Guide',
      packaging_type: product.packaging_type || attributes.packaging_type || 'Signature Rigid Luxury Gift Box with Satin Ribbon Wrap',

      // Returns & Exchange
      return_policy: product.return_policy || attributes.return_policy || '7 Days Hassle-Free Returns on eligible items',
      exchange_policy: product.exchange_policy || attributes.exchange_policy || '7 Days Easy Exchange for size, color or style',
      damaged_policy: product.damaged_policy || attributes.damaged_policy || '100% Free Replacement or Full Refund on items damaged in transit (Unboxing video recommended)',
      return_window: product.return_window || attributes.return_window || '7 Days from delivery date',
      personalized_policy: product.personalized_policy || attributes.personalized_policy || 'Customized / Monogrammed orders are non-returnable unless defective',

      // Care Instructions
      care_instructions: product.care_instructions || '• Keep away from moisture, direct water splashes, and high humidity.\n• Store in the provided breathable dust bag or luxury box when not in use.\n• Avoid direct contact with perfumes, deodorants, or chemical sprays.\n• Spot clean gently with a soft dry cloth; Professional Dry Clean Only.',

      // SEO
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      og_image: product.og_image || '',
      keywords: product.keywords || '',
      canonical_url: product.canonical_url || ''
    } : {
      name: '',
      slug: '',
      category_id: '',
      product_type: 'Handcrafted Potli',
      sku: '',
      status: 'DRAFT',
      featured: false,
      is_enquiry_only: isEnquiryMode,
      short_description: '',
      description: 'Experience timeless luxury with this meticulously handcrafted potli bag from Shahi Boutique. Designed with heritage artisan techniques, every stitch embodies elegance, celebrating traditional craftsmanship for your most special moments.\n\nCrafted with premium materials and adorned with intricate embellishments, this exquisite piece effortlessly elevates bridal trousseaus, wedding ensembles, and festive soirées. Features a spacious interior lined with lustrous fabric to hold all your celebration essentials.',
      price: '',
      sale_price: '',
      stock: 10,
      price_cad: '',
      sale_price_cad: '',
      price_aud: '',
      sale_price_aud: '',
      price_nzd: '',
      sale_price_nzd: '',
      price_usd: '',
      sale_price_usd: '',
      age_group: 'All Ages',
      height_cm: 22,
      length_cm: 18,
      weight: 350,
      dimensions: '22 cm (H) x 18 cm (L) x 6 cm (W)',
      fabric: 'Pure Micro Velvet',
      material: 'Velvet, Satin Lining, Zari & Pearl Beads',
      color: 'Royal Maroon',
      work: 'Hand Zari Embroidery, Pearl Beads & Sequins',
      closure: 'Drawstring with Handcrafted Latkans',
      handle: 'Embroidered Wristlet Loop Handle',
      craft: '100% Artisan Handcrafted in India',
      occasion: 'Wedding / Festive / Party / Gifting',
      country_of_origin: 'India',
      processing_time: '1–2 Business Days',
      estimated_delivery: '4–7 Business Days across India',
      shipping_availability: 'In Stock — Ready to Dispatch',
      free_shipping_threshold: 'Free Standard Shipping on all Prepaid Orders',
      international_shipping: 'Available worldwide via WhatsApp Concierge',
      package_includes: '1x Handcrafted Potli Bag, 1x Luxury Satin Dust Bag, 1x Care Guide',
      packaging_type: 'Signature Rigid Luxury Gift Box with Satin Ribbon Wrap',
      return_policy: '7 Days Hassle-Free Returns on eligible items',
      exchange_policy: '7 Days Easy Exchange for alternate style/color',
      damaged_policy: '100% Free Replacement or Full Refund on items damaged in transit (Unboxing video recommended)',
      return_window: '7 Days from delivery date',
      personalized_policy: 'Customized / Monogrammed orders are non-returnable unless defective',
      care_instructions: '• Keep away from moisture, direct water splashes, and high humidity.\n• Store in the provided breathable dust bag or luxury box when not in use.\n• Avoid direct contact with perfumes, deodorants, or chemical sprays.\n• Spot clean gently with a soft dry cloth; Professional Dry Clean Only.',
      meta_title: '',
      meta_description: '',
      og_image: '',
      keywords: '',
      canonical_url: ''
    }
  })

  // Watch form values in real-time for live preview & auto-calculations
  const watchedValues = useWatch({ control: form.control })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('name', e.target.value)
    if (!product && !form.getValues('slug')) {
      form.setValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  // Real-time Discount % Calculation
  const discountInfo = useMemo(() => {
    const rawPrice = Number(watchedValues.price)
    const rawSalePrice = watchedValues.sale_price !== '' && watchedValues.sale_price != null ? Number(watchedValues.sale_price) : null
    
    // In our system: price is MRP / Original, sale_price is the discounted Selling Price
    if (rawPrice && rawSalePrice && rawPrice > rawSalePrice) {
      const discountPercent = Math.round(((rawPrice - rawSalePrice) / rawPrice) * 100)
      const savings = rawPrice - rawSalePrice
      return {
        hasDiscount: true,
        discountPercent,
        savings,
        mrp: rawPrice,
        sellingPrice: rawSalePrice
      }
    } else if (rawSalePrice && rawSalePrice > 0) {
      return {
        hasDiscount: false,
        discountPercent: 0,
        savings: 0,
        mrp: rawPrice || rawSalePrice,
        sellingPrice: rawSalePrice
      }
    } else if (rawPrice && rawPrice > 0) {
      return {
        hasDiscount: false,
        discountPercent: 0,
        savings: 0,
        mrp: rawPrice,
        sellingPrice: rawPrice
      }
    }
    return {
      hasDiscount: false,
      discountPercent: 0,
      savings: 0,
      mrp: 0,
      sellingPrice: 0
    }
  }, [watchedValues.price, watchedValues.sale_price])

  // Image upload handling
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setSelectedImages(prev => [...prev, ...newImages])
    e.target.value = '' 
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Quick Chip click helper
  const setFieldChip = (field: keyof ProductFormValues, value: string) => {
    form.setValue(field, value, { shouldDirty: true, shouldValidate: true })
  }

  // Append text to care instructions
  const appendCareInstruction = (text: string) => {
    const current = form.getValues('care_instructions') || ''
    if (current.includes(text)) return
    const updated = current ? `${current}\n• ${text}` : `• ${text}`
    form.setValue('care_instructions', updated, { shouldDirty: true })
  }

  // Form Submission
  const onSubmit = async (data: ProductFormValues) => {
    setError(null)

    const num = (v: any) => (v === "" || v == null ? null : Number(v))

    const payload: ProductPayload = {
      id: product?.id,
      name: data.name,
      slug: data.slug,
      category_id: data.category_id || null,
      product_type: data.product_type || 'Handcrafted Potli',
      sku: data.sku || undefined,
      status: data.status || 'DRAFT',
      featured: Boolean(data.featured),
      is_enquiry_only: Boolean(data.is_enquiry_only),
      short_description: data.short_description,
      description: data.description,

      // Pricing & Inventory
      price: data.price === "" || data.price == null ? 0 : Number(data.price),
      sale_price: data.sale_price === "" || data.sale_price == null ? null : Number(data.sale_price),
      stock: data.stock === "" || data.stock == null ? 0 : Number(data.stock),
      price_inr: data.price === "" || data.price == null ? 0 : Number(data.price),
      sale_price_inr: data.sale_price === "" || data.sale_price == null ? null : Number(data.sale_price),
      price_cad: num(data.price_cad),
      sale_price_cad: num(data.sale_price_cad),
      price_aud: num(data.price_aud),
      sale_price_aud: num(data.sale_price_aud),
      price_nzd: num(data.price_nzd),
      sale_price_nzd: num(data.sale_price_nzd),
      price_usd: num(data.price_usd),
      sale_price_usd: num(data.sale_price_usd),

      // Dimensions & Specs
      age_group: data.age_group,
      height_cm: num(data.height_cm),
      length_cm: num(data.length_cm),
      weight: num(data.weight),
      dimensions: data.dimensions,

      // Details
      fabric: data.fabric,
      material: data.material,
      color: data.color,
      work: data.work,
      closure: data.closure,
      handle: data.handle,
      craft: data.craft,
      occasion: data.occasion,
      country_of_origin: data.country_of_origin || 'India',

      // Shipping
      processing_time: data.processing_time,
      estimated_delivery: data.estimated_delivery,
      shipping_availability: data.shipping_availability,
      free_shipping_threshold: data.free_shipping_threshold,
      international_shipping: data.international_shipping,
      package_includes: data.package_includes,
      packaging_type: data.packaging_type,

      // Returns
      return_policy: data.return_policy,
      exchange_policy: data.exchange_policy,
      damaged_policy: data.damaged_policy,
      return_window: data.return_window,
      personalized_policy: data.personalized_policy,

      // Care
      care_instructions: data.care_instructions,

      // SEO
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      og_image: data.og_image,
      keywords: data.keywords,
      canonical_url: data.canonical_url
    }

    const res = await saveProductDetails(payload)

    if (res?.error) {
      setError(res.error)
    } else if (res.id) {
      if (selectedImages.length > 0) {
        setUploadingImages(true)
        try {
          const formData = new FormData()
          for (let i = 0; i < selectedImages.length; i++) {
             formData.append('images', selectedImages[i].file, selectedImages[i].file.name)
          }
          await uploadProductImages(res.id, formData)
        } catch (err: any) {
          setError('Product saved, but image upload encountered an error: ' + err.message)
          setUploadingImages(false)
          return
        }
      }

      if (!product) {
        window.location.href = `/2010admin/products/${res.id}/edit`
      } else {
        setSelectedImages([])
        setUploadingImages(false)
      }
    }
  }

  // Luxury UI Styling Classes
  const cardClass = "rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:border-gray-200"
  const headerClass = "text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-3 border-b border-gray-50 pb-5 mb-6"
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block"
  const inputClass = "rounded-xl border-gray-200 bg-gray-50/70 shadow-sm focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:border-[#FF7A00] hover:bg-white text-gray-900 font-medium transition-colors"
  const chipClass = "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#FF7A00] hover:text-[#FF7A00] hover:bg-orange-50/30 transition-all cursor-pointer select-none"
  const activeChipClass = "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#FF7A00] bg-orange-50 text-[#FF7A00] transition-all cursor-pointer select-none shadow-sm"

  // Selected Category name
  const selectedCategoryName = categories.find(c => c.id === watchedValues.category_id)?.name || 'Potli Bags'

  // Primary image preview for live preview card
  const primaryPreviewImage = selectedImages[0]?.preview || (product?.product_images?.find((img: any) => img.is_primary)?.url || product?.product_images?.[0]?.url)

  return (
    <div className="relative">
      {/* Mobile Floating Live Preview Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          type="button"
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="rounded-full bg-[#1C1C1C] text-white shadow-2xl px-5 py-4 flex items-center gap-2 border border-white/20 hover:bg-[#FF7A00] transition-colors"
        >
          <Eye className="w-4 h-4 text-[#FF7A00]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {showMobilePreview ? 'Hide Preview' : 'Live Preview'}
          </span>
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-16">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-[2rem] text-xs font-bold tracking-widest uppercase flex items-center gap-3">
            <Info className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Grid: Left side Form, Right side Sticky Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 8 Specification Sections */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* ---------------------------------------------------- */}
            {/* 1. BASIC DETAILS */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center font-black text-xs">1</div>
                  <span>Basic Details</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div>
                      <Label htmlFor="name" className={labelClass}>Product Name *</Label>
                      <Input 
                        id="name" 
                        {...form.register('name')} 
                        onChange={handleNameChange} 
                        className={inputClass} 
                        placeholder="e.g. Series 02 / Velvet Potli" 
                      />
                      {form.formState.errors.name && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    {/* URL Slug */}
                    <div>
                      <Label htmlFor="slug" className={labelClass}>URL Slug *</Label>
                      <Input 
                        id="slug" 
                        {...form.register('slug')} 
                        className={inputClass} 
                        placeholder="series-02-velvet-potli" 
                      />
                      {form.formState.errors.slug && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2">{form.formState.errors.slug.message}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <Label htmlFor="category_id" className={labelClass}>Category</Label>
                      <select 
                        id="category_id" 
                        {...form.register('category_id')}
                        className={`flex h-10 w-full px-3 py-2 text-sm outline-none ${inputClass}`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* SKU */}
                    <div>
                      <Label htmlFor="sku" className={labelClass}>SKU (Stock Keeping Unit)</Label>
                      <Input 
                        id="sku" 
                        {...form.register('sku')} 
                        className={inputClass} 
                        placeholder="e.g. SB-POT-002" 
                      />
                    </div>
                  </div>

                  {/* Product Type with Quick Selection Chips */}
                  <div>
                    <Label htmlFor="product_type" className={labelClass}>Product Type</Label>
                    <Input 
                      id="product_type" 
                      {...form.register('product_type')} 
                      className={inputClass} 
                      placeholder="e.g. Handcrafted Potli, Bridal Clutch..." 
                    />
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {[
                        'Handcrafted Potli', 
                        'Bridal Batwa', 
                        'Embroidered Clutch', 
                        'Silk Pouch Bag', 
                        'Designer Wristlet', 
                        'Festive Bucket Bag'
                      ].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFieldChip('product_type', type)}
                          className={watchedValues.product_type === type ? activeChipClass : chipClass}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status & Modes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-100">
                    <div>
                      <Label htmlFor="status" className={labelClass}>Status</Label>
                      <select 
                        id="status" 
                        {...form.register('status')}
                        className={`flex h-10 w-full px-3 py-2 text-sm outline-none ${inputClass}`}
                      >
                        <option value="ACTIVE">🟢 Published (Active)</option>
                        <option value="DRAFT">🟡 Draft (Hidden)</option>
                        <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
                        <option value="ARCHIVED">⚪ Archived</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3 pt-6">
                      <input 
                        type="checkbox" 
                        id="featured" 
                        {...form.register('featured')} 
                        className="h-5 w-5 rounded border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] cursor-pointer" 
                      />
                      <Label htmlFor="featured" className={`${labelClass} !mb-0 cursor-pointer text-gray-700`}>
                        Featured Product
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 pt-6">
                      <input 
                        type="checkbox" 
                        id="is_enquiry_only" 
                        {...form.register('is_enquiry_only')} 
                        className="h-5 w-5 rounded border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] cursor-pointer" 
                      />
                      <Label htmlFor="is_enquiry_only" className={`${labelClass} !mb-0 cursor-pointer text-gray-700`}>
                        Enquiry Mode Only
                      </Label>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="pt-2">
                    <Label htmlFor="short_description" className={labelClass}>Short Summary / Excerpt (1-2 lines)</Label>
                    <Input 
                      id="short_description" 
                      {...form.register('short_description')} 
                      className={inputClass} 
                      placeholder="e.g. Royal micro velvet potli adorned with intricate hand-embroidered pearls and zari work." 
                    />
                  </div>

                  {/* Full Product Description (2-4 paragraphs) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="description" className={labelClass}>Product Description (2–4 Paragraphs Story & Craft)</Label>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {(watchedValues.description || '').length} characters
                      </span>
                    </div>
                    <Textarea 
                      id="description" 
                      {...form.register('description')} 
                      rows={6} 
                      className={`${inputClass} leading-relaxed`} 
                      placeholder="Write 2-4 rich paragraphs detailing the design inspiration, artisan craftsmanship, velvet textures, and styling possibilities..." 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 2. 💰 PRICING & REAL-TIME DISCOUNT CALCULATOR */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">2</div>
                  <span>💰 Pricing & Real-Time Discount Calculator</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Original / MRP */}
                    <div>
                      <Label htmlFor="price" className={labelClass}>Original / MRP (₹) *</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        step="1"
                        {...form.register('price')} 
                        className={inputClass} 
                        placeholder="e.g. 3999" 
                      />
                      <span className="text-[9px] font-medium text-gray-400 block mt-1">Standard Market / Maximum Retail Price</span>
                    </div>

                    {/* Selling / Sale Price */}
                    <div>
                      <Label htmlFor="sale_price" className={labelClass}>Selling Price (₹)</Label>
                      <Input 
                        id="sale_price" 
                        type="number" 
                        step="1"
                        {...form.register('sale_price')} 
                        className={inputClass} 
                        placeholder="e.g. 2499" 
                      />
                      <span className="text-[9px] font-medium text-gray-400 block mt-1">Customer Checkout Price</span>
                    </div>

                    {/* Available Stock */}
                    <div>
                      <Label htmlFor="stock" className={labelClass}>Available Stock</Label>
                      <Input 
                        id="stock" 
                        type="number" 
                        {...form.register('stock')} 
                        className={inputClass} 
                        placeholder="e.g. 10" 
                      />
                      <span className="text-[9px] font-medium text-gray-400 block mt-1">Current units in inventory</span>
                    </div>
                  </div>

                  {/* Real-Time Live Discount Badge Box */}
                  <div className="rounded-2xl border border-gray-100 bg-[#F8F9FA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-black text-sm">
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Auto Calculated Discount</span>
                        {discountInfo.hasDiscount ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg font-black text-[#FF7A00] tracking-tight">
                              {discountInfo.discountPercent}% OFF
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              Customer saves ₹{discountInfo.savings.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-600">Standard Price (No discount applied)</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Final Price on Store</span>
                      <span className="text-base font-black text-gray-900">
                        ₹{(discountInfo.sellingPrice || discountInfo.mrp || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Global International Currency Pricing Accordion */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGlobalPricing(!showGlobalPricing)}
                      className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                          Global International Currencies (USD, CAD, AUD, NZD)
                        </span>
                      </div>
                      {showGlobalPricing ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {showGlobalPricing && (
                      <div className="mt-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Optional price overrides per country (Leave blank for auto-conversion):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className={labelClass}>USD ($)</Label>
                            <Input type="number" step="0.01" {...form.register('price_usd')} className={inputClass} placeholder="MRP ($)" />
                            <Input type="number" step="0.01" {...form.register('sale_price_usd')} className={`${inputClass} mt-2`} placeholder="Sale ($)" />
                          </div>
                          <div>
                            <Label className={labelClass}>CAD (C$)</Label>
                            <Input type="number" step="0.01" {...form.register('price_cad')} className={inputClass} placeholder="MRP (C$)" />
                            <Input type="number" step="0.01" {...form.register('sale_price_cad')} className={`${inputClass} mt-2`} placeholder="Sale (C$)" />
                          </div>
                          <div>
                            <Label className={labelClass}>AUD (A$)</Label>
                            <Input type="number" step="0.01" {...form.register('price_aud')} className={inputClass} placeholder="MRP (A$)" />
                            <Input type="number" step="0.01" {...form.register('sale_price_aud')} className={`${inputClass} mt-2`} placeholder="Sale (A$)" />
                          </div>
                          <div>
                            <Label className={labelClass}>NZD (NZ$)</Label>
                            <Input type="number" step="0.01" {...form.register('price_nzd')} className={inputClass} placeholder="MRP (NZ$)" />
                            <Input type="number" step="0.01" {...form.register('sale_price_nzd')} className={`${inputClass} mt-2`} placeholder="Sale (NZ$)" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 3. 📏 DIMENSIONS & SPECS (FLEXIBLE) */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">3</div>
                  <span>📏 Dimensions & Physical Specifications (Flexible)</span>
                </div>

                <div className="space-y-6">
                  {/* Age Group (Optional) */}
                  <div>
                    <Label htmlFor="age_group" className={labelClass}>Target Age Group (Optional)</Label>
                    <Input 
                      id="age_group" 
                      {...form.register('age_group')} 
                      className={inputClass} 
                      placeholder="e.g. All Ages / Adults (18+) / Bridal" 
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['All Ages', 'Adults (18+)', 'Teens & Adults', 'Bridal / Women'].map(age => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setFieldChip('age_group', age)}
                          className={watchedValues.age_group === age ? activeChipClass : chipClass}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Height */}
                    <div>
                      <Label htmlFor="height_cm" className={labelClass}>Height (cm / in)</Label>
                      <Input 
                        id="height_cm" 
                        type="number" 
                        step="0.1" 
                        {...form.register('height_cm')} 
                        className={inputClass} 
                        placeholder="e.g. 22" 
                      />
                    </div>

                    {/* Length */}
                    <div>
                      <Label htmlFor="length_cm" className={labelClass}>Length / Width (cm / in)</Label>
                      <Input 
                        id="length_cm" 
                        type="number" 
                        step="0.1" 
                        {...form.register('length_cm')} 
                        className={inputClass} 
                        placeholder="e.g. 18" 
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <Label htmlFor="weight" className={labelClass}>Weight (Grams)</Label>
                      <Input 
                        id="weight" 
                        type="number" 
                        {...form.register('weight')} 
                        className={inputClass} 
                        placeholder="e.g. 350" 
                      />
                    </div>
                  </div>

                  {/* Formatted Dimensions Text */}
                  <div>
                    <Label htmlFor="dimensions" className={labelClass}>Formatted Dimensions Summary</Label>
                    <Input 
                      id="dimensions" 
                      {...form.register('dimensions')} 
                      className={inputClass} 
                      placeholder="e.g. 22 cm (Height) x 18 cm (Base Length) x 6 cm (Depth)" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 4. 🧵 PRODUCT DETAILS & CRAFTSMANSHIP */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs">4</div>
                  <span>🧵 Product Details & Artistry</span>
                </div>

                <div className="space-y-6">
                  {/* Material & Fabric */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fabric" className={labelClass}>Primary Fabric</Label>
                      <Input 
                        id="fabric" 
                        {...form.register('fabric')} 
                        className={inputClass} 
                        placeholder="e.g. Pure Micro Velvet" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['Pure Velvet', 'Raw Silk', 'Organza', 'Rich Brocade', 'Satin', 'Georgette'].map(fab => (
                          <button
                            key={fab}
                            type="button"
                            onClick={() => setFieldChip('fabric', fab)}
                            className={watchedValues.fabric === fab ? activeChipClass : chipClass}
                          >
                            {fab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="material" className={labelClass}>Material Composition</Label>
                      <Input 
                        id="material" 
                        {...form.register('material')} 
                        className={inputClass} 
                        placeholder="e.g. Velvet, Silk Lining, Pearl Beads" 
                      />
                    </div>
                  </div>

                  {/* Color & Work */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="color" className={labelClass}>Primary Color</Label>
                      <Input 
                        id="color" 
                        {...form.register('color')} 
                        className={inputClass} 
                        placeholder="e.g. Royal Maroon, Antique Gold" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'Royal Maroon', 
                          'Emerald Green', 
                          'Midnight Black', 
                          'Antique Gold', 
                          'Blush Pink', 
                          'Ruby Red', 
                          'Ivory Cream'
                        ].map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setFieldChip('color', col)}
                            className={watchedValues.color === col ? activeChipClass : chipClass}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="work" className={labelClass}>Work / Embellishment</Label>
                      <Input 
                        id="work" 
                        {...form.register('work')} 
                        className={inputClass} 
                        placeholder="e.g. Hand Zari Embroidery & Pearls" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'Zari Embroidery', 
                          'Pearl Work', 
                          'Sequins & Cutdana', 
                          'Gota Patti', 
                          'Mirror Work', 
                          'Dabka & Resham'
                        ].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setFieldChip('work', w)}
                            className={watchedValues.work === w ? activeChipClass : chipClass}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Closure & Handle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="closure" className={labelClass}>Closure Type</Label>
                      <Input 
                        id="closure" 
                        {...form.register('closure')} 
                        className={inputClass} 
                        placeholder="e.g. Drawstring with Latkans" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'Drawstring with Latkans', 
                          'Magnetic Snap Clasp', 
                          'Zip Closure', 
                          'Kiss-Lock Clasp'
                        ].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFieldChip('closure', c)}
                            className={watchedValues.closure === c ? activeChipClass : chipClass}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="handle" className={labelClass}>Handle / Strap</Label>
                      <Input 
                        id="handle" 
                        {...form.register('handle')} 
                        className={inputClass} 
                        placeholder="e.g. Embroidered Loop Handle + Chain" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'Loop Wristlet Handle', 
                          'Detachable Gold Chain', 
                          'Pearl Handle', 
                          'Braided Velvet Handle'
                        ].map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFieldChip('handle', h)}
                            className={watchedValues.handle === h ? activeChipClass : chipClass}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Craft & Occasion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="craft" className={labelClass}>Craft Type</Label>
                      <Input 
                        id="craft" 
                        {...form.register('craft')} 
                        className={inputClass} 
                        placeholder="e.g. 100% Artisan Handcrafted" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          '100% Artisan Handcrafted', 
                          'Hand-Embroidered Handloom', 
                          'Semi-Handcrafted', 
                          'Machine Precision'
                        ].map(cr => (
                          <button
                            key={cr}
                            type="button"
                            onClick={() => setFieldChip('craft', cr)}
                            className={watchedValues.craft === cr ? activeChipClass : chipClass}
                          >
                            {cr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="occasion" className={labelClass}>Occasion</Label>
                      <Input 
                        id="occasion" 
                        {...form.register('occasion')} 
                        className={inputClass} 
                        placeholder="e.g. Wedding / Festive / Gifting" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          'Wedding & Festive', 
                          'Bridal Trousseau', 
                          'Cocktail & Party', 
                          'Luxury Gifting', 
                          'Casual Chic'
                        ].map(occ => (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => setFieldChip('occasion', occ)}
                            className={watchedValues.occasion === occ ? activeChipClass : chipClass}
                          >
                            {occ}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 5. 📸 IMAGES & PRODUCT GALLERY */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-black text-xs">5</div>
                  <span>📸 Product Gallery (Front & Additional Angles)</span>
                </div>

                <p className="text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-widest">
                  Upload high-resolution photography. The first image will be set as primary.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 group shadow-sm">
                      <img src={img.preview} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-[#FF7A00] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md">
                          Front Cover
                        </span>
                      )}
                      <button 
                        type="button" 
                        onClick={() => removeSelectedImage(idx)} 
                        className="absolute top-2 right-2 bg-[#1C1C1C]/80 hover:bg-red-600 rounded-full text-white p-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <label className="border-2 border-dashed rounded-2xl hover:border-[#FF7A00] border-gray-200 flex flex-col items-center justify-center aspect-[3/4] text-gray-400 hover:text-[#FF7A00] transition-colors cursor-pointer bg-gray-50/50 hover:bg-orange-50/30">
                    <Upload className="h-6 w-6 mb-2" strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-center px-2">Upload Angles</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelection} disabled={uploadingImages} />
                  </label>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 6. 📦 SHIPPING DETAILS */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">6</div>
                  <span>📦 Shipping & Packaging Details</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Processing Time */}
                    <div>
                      <Label htmlFor="processing_time" className={labelClass}>Processing / Dispatch Time</Label>
                      <Input 
                        id="processing_time" 
                        {...form.register('processing_time')} 
                        className={inputClass} 
                        placeholder="e.g. 1–2 Business Days" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['1–2 Business Days', 'Same Day Dispatch', '3–5 Days (Made to Order)'].map(pt => (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => setFieldChip('processing_time', pt)}
                            className={watchedValues.processing_time === pt ? activeChipClass : chipClass}
                          >
                            {pt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div>
                      <Label htmlFor="estimated_delivery" className={labelClass}>Estimated Delivery Timeline</Label>
                      <Input 
                        id="estimated_delivery" 
                        {...form.register('estimated_delivery')} 
                        className={inputClass} 
                        placeholder="e.g. 4–7 Business Days across India" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['4–7 Business Days across India', '3–5 Days Express Delivery', '5–10 Days Standard'].map(ed => (
                          <button
                            key={ed}
                            type="button"
                            onClick={() => setFieldChip('estimated_delivery', ed)}
                            className={watchedValues.estimated_delivery === ed ? activeChipClass : chipClass}
                          >
                            {ed}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Availability */}
                    <div>
                      <Label htmlFor="shipping_availability" className={labelClass}>Shipping Availability</Label>
                      <Input 
                        id="shipping_availability" 
                        {...form.register('shipping_availability')} 
                        className={inputClass} 
                        placeholder="e.g. In Stock — Ready to Dispatch" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['In Stock — Ready to Dispatch', 'Pre-Order Only', 'Limited Artisan Batch'].map(sa => (
                          <button
                            key={sa}
                            type="button"
                            onClick={() => setFieldChip('shipping_availability', sa)}
                            className={watchedValues.shipping_availability === sa ? activeChipClass : chipClass}
                          >
                            {sa}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Free Shipping Policy */}
                    <div>
                      <Label htmlFor="free_shipping_threshold" className={labelClass}>Free Shipping Offer / Threshold</Label>
                      <Input 
                        id="free_shipping_threshold" 
                        {...form.register('free_shipping_threshold')} 
                        className={inputClass} 
                        placeholder="e.g. Free Standard Shipping on all Prepaid Orders" 
                      />
                    </div>
                  </div>

                  {/* International Shipping */}
                  <div>
                    <Label htmlFor="international_shipping" className={labelClass}>International Shipping Terms</Label>
                    <Input 
                      id="international_shipping" 
                      {...form.register('international_shipping')} 
                      className={inputClass} 
                      placeholder="e.g. Available worldwide via WhatsApp Concierge" 
                    />
                  </div>

                  {/* Package Includes & Packaging Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="package_includes" className={labelClass}>What's in the Box (Package Includes)</Label>
                      <Textarea 
                        id="package_includes" 
                        {...form.register('package_includes')} 
                        rows={2}
                        className={inputClass} 
                        placeholder="e.g. 1x Handcrafted Potli Bag, 1x Luxury Satin Dust Bag, 1x Authenticity Card" 
                      />
                    </div>

                    <div>
                      <Label htmlFor="packaging_type" className={labelClass}>Packaging Presentation</Label>
                      <Textarea 
                        id="packaging_type" 
                        {...form.register('packaging_type')} 
                        rows={2}
                        className={inputClass} 
                        placeholder="e.g. Signature Rigid Luxury Gift Box with Satin Ribbon Wrap" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 7. 🔄 RETURNS & EXCHANGE POLICY */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs">7</div>
                  <span>🔄 Returns, Exchange & Guarantee Policy</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Return Availability */}
                    <div>
                      <Label htmlFor="return_policy" className={labelClass}>Return Policy</Label>
                      <Input 
                        id="return_policy" 
                        {...form.register('return_policy')} 
                        className={inputClass} 
                        placeholder="e.g. 7 Days Hassle-Free Returns on eligible items" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['7 Days Hassle-Free Returns', 'Returns Accepted on Unworn Items', 'Non-Returnable (Handcrafted)'].map(rp => (
                          <button
                            key={rp}
                            type="button"
                            onClick={() => setFieldChip('return_policy', rp)}
                            className={watchedValues.return_policy === rp ? activeChipClass : chipClass}
                          >
                            {rp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Exchange Availability */}
                    <div>
                      <Label htmlFor="exchange_policy" className={labelClass}>Exchange Policy</Label>
                      <Input 
                        id="exchange_policy" 
                        {...form.register('exchange_policy')} 
                        className={inputClass} 
                        placeholder="e.g. 7 Days Easy Exchange for size/color" 
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['7 Days Easy Exchange', 'Exchange for Alternate Color/Style', 'No Exchange'].map(ep => (
                          <button
                            key={ep}
                            type="button"
                            onClick={() => setFieldChip('exchange_policy', ep)}
                            className={watchedValues.exchange_policy === ep ? activeChipClass : chipClass}
                          >
                            {ep}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Damaged Product Policy */}
                  <div>
                    <Label htmlFor="damaged_policy" className={labelClass}>Damaged In Transit / Defective Guarantee</Label>
                    <Input 
                      id="damaged_policy" 
                      {...form.register('damaged_policy')} 
                      className={inputClass} 
                      placeholder="e.g. 100% Free Replacement or Full Refund on items damaged in transit" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Return Window */}
                    <div>
                      <Label htmlFor="return_window" className={labelClass}>Return / Exchange Window</Label>
                      <Input 
                        id="return_window" 
                        {...form.register('return_window')} 
                        className={inputClass} 
                        placeholder="e.g. 7 Days from delivery date" 
                      />
                    </div>

                    {/* Personalized Items */}
                    <div>
                      <Label htmlFor="personalized_policy" className={labelClass}>Personalized / Custom Items Policy</Label>
                      <Input 
                        id="personalized_policy" 
                        {...form.register('personalized_policy')} 
                        className={inputClass} 
                        placeholder="e.g. Custom / Monogrammed orders are non-returnable" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* 8. 🧼 CARE INSTRUCTIONS */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">8</div>
                  <span>🧼 Care Instructions (Structured Bullet Points)</span>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Click any recommendation below to append it directly to the care instructions:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      'Keep away from direct moisture, water splashes, and high humidity.',
                      'Store in the provided breathable dust bag or luxury box when not in use.',
                      'Avoid direct contact with perfumes, deodorants, or chemical sprays.',
                      'Spot clean gently with a soft dry cloth; Professional Dry Clean Only.',
                      'Protect delicate pearl and sequin embroidery from abrasive surfaces.'
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => appendCareInstruction(item)}
                        className="text-[10px] font-semibold text-gray-700 bg-gray-50 hover:bg-orange-50 hover:text-[#FF7A00] border border-gray-200 px-3 py-1.5 rounded-xl transition-colors text-left flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-[#FF7A00] shrink-0" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Label htmlFor="care_instructions" className={labelClass}>Care Instructions Guide</Label>
                    <Textarea 
                      id="care_instructions" 
                      {...form.register('care_instructions')} 
                      rows={5} 
                      className={`${inputClass} leading-relaxed font-mono text-xs`} 
                      placeholder="• Keep away from moisture...&#10;• Store in dust bag..." 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* ---------------------------------------------------- */}
            {/* SEO OPTIMIZATION */}
            {/* ---------------------------------------------------- */}
            <Card className={cardClass}>
              <CardContent className="p-6 md:p-8">
                <div className={headerClass}>
                  <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-black text-xs">SEO</div>
                  <span>Search Engine Optimization</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="meta_title" className={labelClass}>Meta Title</Label>
                    <Input id="meta_title" {...form.register('meta_title')} className={inputClass} placeholder="e.g. Series 02 Handcrafted Velvet Potli | Shahi Boutique" />
                  </div>
                  <div>
                    <Label htmlFor="meta_description" className={labelClass}>Meta Description</Label>
                    <Textarea id="meta_description" {...form.register('meta_description')} rows={2} className={inputClass} placeholder="Discover handcrafted luxury potlis made with pure micro velvet and pearl zari work..." />
                  </div>
                  <div>
                    <Label htmlFor="keywords" className={labelClass}>Keywords (comma separated)</Label>
                    <Input id="keywords" {...form.register('keywords')} className={inputClass} placeholder="handcrafted potli bag, wedding potli, velvet batwa, bridal clutch" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || uploadingImages} 
                className="rounded-full bg-[#1C1C1C] text-white px-10 py-6 text-xs font-black uppercase tracking-widest hover:bg-[#FF7A00] shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                {form.formState.isSubmitting || uploadingImages ? 'Saving Collection...' : (product ? 'Update Collection Item' : 'Publish to Collection')}
              </Button>
            </div>
          </div>


          {/* ---------------------------------------------------- */}
          {/* RIGHT COLUMN: STICKY REAL-TIME LUXURY LIVE PREVIEW */}
          {/* ---------------------------------------------------- */}
          <div className={`lg:col-span-5 xl:col-span-4 ${showMobilePreview ? 'fixed inset-4 z-50 overflow-y-auto bg-white p-4 rounded-3xl shadow-2xl border' : 'hidden lg:block lg:sticky lg:top-8'}`}>
            
            {showMobilePreview && (
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <span className="text-xs font-black uppercase tracking-widest text-gray-900">Storefront Live Preview</span>
                <button type="button" onClick={() => setShowMobilePreview(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-200/80 shadow-lg p-6 space-y-6">
              
              {/* Live Preview Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
                    Live Storefront Preview
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                  {watchedValues.status || 'DRAFT'}
                </span>
              </div>

              {/* Preview Tabs */}
              <div className="flex bg-gray-100/70 p-1 rounded-xl">
                {[
                  { id: 'card', label: 'Card' },
                  { id: 'details', label: 'Specs' },
                  { id: 'shipping', label: 'Shipping' },
                  { id: 'returns', label: 'Returns' },
                  { id: 'care', label: 'Care' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreviewTab(t.id as any)}
                    className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      previewTab === t.id 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: PRODUCT CARD VIEW */}
              {previewTab === 'card' && (
                <div className="space-y-4">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner group">
                    {primaryPreviewImage ? (
                      <img 
                        src={primaryPreviewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-6 text-center">
                        <Package className="w-12 h-12 mb-2 stroke-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {discountInfo.hasDiscount && (
                        <span className="bg-[#FF7A00] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                          {discountInfo.discountPercent}% OFF
                        </span>
                      )}
                      {watchedValues.craft && (
                        <span className="bg-[#1C1C1C]/80 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                          {watchedValues.craft.split(' ')[0]} Artisan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      <span>{selectedCategoryName}</span>
                      {watchedValues.sku && <span>{watchedValues.sku}</span>}
                    </div>
                    <h4 className="text-base font-black text-gray-900 uppercase tracking-tight line-clamp-1">
                      {watchedValues.name || 'Untitled Product'}
                    </h4>
                    {watchedValues.product_type && (
                      <span className="text-[10px] font-semibold text-[#FF7A00] uppercase tracking-wider">
                        {watchedValues.product_type}
                      </span>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      {watchedValues.is_enquiry_only ? (
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Starting at</span>
                          <span className="text-lg font-black text-gray-900">₹{(discountInfo.mrp || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ) : discountInfo.hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-[#FF7A00]">
                            ₹{discountInfo.sellingPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-gray-400 line-through">
                            ₹{discountInfo.mrp.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-gray-900">
                          ₹{(discountInfo.sellingPrice || discountInfo.mrp || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                        {Number(watchedValues.stock) > 0 ? `${watchedValues.stock} in stock` : 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Short Excerpt */}
                  {watchedValues.short_description && (
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                      {watchedValues.short_description}
                    </p>
                  )}
                </div>
              )}

              {/* TAB 2: SPECIFICATIONS PREVIEW */}
              {previewTab === 'details' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Artisan Specs</span>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Fabric</span>
                      <span className="font-bold text-gray-900">{watchedValues.fabric || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Color</span>
                      <span className="font-bold text-gray-900">{watchedValues.color || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Work</span>
                      <span className="font-bold text-gray-900">{watchedValues.work || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Closure</span>
                      <span className="font-bold text-gray-900">{watchedValues.closure || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Handle</span>
                      <span className="font-bold text-gray-900">{watchedValues.handle || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Craft</span>
                      <span className="font-bold text-gray-900">{watchedValues.craft || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Occasion</span>
                      <span className="font-bold text-gray-900">{watchedValues.occasion || '-'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Dimensions</span>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Height</span>
                      <span className="font-bold text-gray-900">{watchedValues.height_cm ? `${watchedValues.height_cm} cm` : '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Length</span>
                      <span className="font-bold text-gray-900">{watchedValues.length_cm ? `${watchedValues.length_cm} cm` : '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Weight</span>
                      <span className="font-bold text-gray-900">{watchedValues.weight ? `${watchedValues.weight} g` : '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SHIPPING PREVIEW */}
              {previewTab === 'shipping' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-orange-50/40 rounded-xl border border-orange-100 flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 block">Delivery Timeline</span>
                      <span className="font-bold text-gray-900">{watchedValues.estimated_delivery || '4–7 Business Days across India'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Processing</span>
                      <span className="font-bold text-gray-900">{watchedValues.processing_time || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-bold text-gray-900">{watchedValues.free_shipping_threshold || '-'}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-gray-500 block mb-0.5">Packaging</span>
                      <span className="font-bold text-gray-900">{watchedValues.packaging_type || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RETURNS PREVIEW */}
              {previewTab === 'returns' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 block">Returns & Window</span>
                      <span className="font-bold text-gray-900">{watchedValues.return_policy || '7 Days Hassle-Free Returns'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200/50">
                      <span className="text-gray-500">Exchange</span>
                      <span className="font-bold text-gray-900">{watchedValues.exchange_policy || '-'}</span>
                    </div>
                    <div className="py-1">
                      <span className="text-gray-500 block mb-0.5">Damage Protection</span>
                      <span className="font-bold text-gray-900">{watchedValues.damaged_policy || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CARE GUIDE PREVIEW */}
              {previewTab === 'care' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Care & Preservation Guide</span>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed font-medium">
                    {watchedValues.care_instructions || 'Dry clean only. Keep away from moisture and direct sunlight.'}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
