import type { Metadata } from 'next'
import { ContactForm } from '@/components/storefront/ContactForm'
import { createPublicClient } from '@/lib/supabase/server'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Contact Us | SHAHI',
  description: 'Get in touch with our customer service team.',
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams
  const productSlug = resolvedParams?.product as string | undefined
  let product = null

  if (productSlug) {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('products')
      .select('*, product_images(url, is_primary)')
      .eq('slug', productSlug)
      .single()
    product = data
  }

  return (
    <div className="bg-white min-h-screen pb-32 pt-24">
      {/* Header Banner - Only show if NO product enquiry */}
      {!product && (
        <div className="bg-[#F8F9FA] py-24 px-6 sm:px-8 lg:px-12 text-center rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 mb-16 shadow-sm border border-gray-100">
          <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-[0.2em] mb-4 block">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-6 leading-none">CONCIERGE</h1>
          <p className="mt-6 text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            We are dedicated to providing you with an exceptional experience. How may we assist you today?
          </p>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16">
        <div className={`grid grid-cols-1 ${!product ? 'lg:grid-cols-2 gap-16 lg:gap-24 items-start' : 'max-w-3xl mx-auto gap-8'} max-w-6xl mx-auto`}>
          
          {/* Customer Service Info - Only show if NO product enquiry */}
          {!product && (
            <div className="bg-[#F8F9FA] p-10 sm:p-14 lg:p-16 rounded-[3rem] border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 border-b border-gray-200 pb-4">Client Services</h2>
              <div className="space-y-8 text-sm text-gray-500 font-medium leading-relaxed">
                <p>
                  Our client advisors are available to assist you with style advice, detailed product information, delivery questions, and returns. We aim to respond to all inquiries within 24 hours.
                </p>
                
                <div className="pt-6 border-t border-gray-200">
                  <p className="font-bold text-[10px] tracking-widest uppercase text-gray-400 mb-2">Email</p>
                  <a href="mailto:contact.shahiboutique@gmail.com" className="text-gray-900 font-bold hover:text-[#FF7A00] transition-colors text-base">contact.shahiboutique@gmail.com</a>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <p className="font-bold text-[10px] tracking-widest uppercase text-gray-400 mb-2">Phone</p>
                  <a href="tel:+919217890060" className="text-gray-900 font-bold hover:text-[#FF7A00] transition-colors text-base">+91 9217890060</a>
                  <p className="text-xs mt-2 text-gray-400">Monday to Friday, 9am - 6pm IST</p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="font-bold text-[10px] tracking-widest uppercase text-gray-400 mb-2">WhatsApp</p>
                  <a href="https://wa.me/919041762820" className="text-gray-900 font-bold hover:text-[#FF7A00] transition-colors text-base">+91 9041762820</a>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="font-bold text-[10px] tracking-widest uppercase text-gray-400 mb-2">Flagship Boutique</p>
                  <p className="text-gray-900 font-bold text-base leading-snug">Telian Bazar<br/>Malerkotla, Punjab 148023<br/>India</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Form or Enquiry Form */}
          <div className={!product ? "lg:pl-8" : ""}>
            {product ? (
              <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-gray-900 mb-4">Request Details</h2>
                <p className="text-sm md:text-base text-gray-500 font-medium mb-10 max-w-lg mx-auto">Please provide your details below. Our luxury consultants will assist you personally.</p>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-left gap-6 p-6 md:p-8 rounded-[2rem] bg-[#F8F9FA] border border-gray-100 shadow-sm mb-12 max-w-2xl mx-auto">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                    {product.product_images?.[0]?.url ? (
                      <Image 
                        src={product.product_images.find((img: any) => img.is_primary)?.url || product.product_images[0].url} 
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 py-2 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF7A00] block mb-2">Enquiry For</span>
                    <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight mb-3">{product.name}</h3>
                    {product.sale_price ? (
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="text-lg md:text-xl font-black text-gray-900">Rs. {product.sale_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs md:text-sm text-gray-400 line-through">Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ) : (
                      <span className="text-lg md:text-xl font-black text-gray-900">Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-10 border-b border-gray-200 pb-4">Send a Message</h2>
            )}
            
            <div className={product ? "max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm" : ""}>
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
