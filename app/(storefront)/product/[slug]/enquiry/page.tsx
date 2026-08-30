import { createClient, createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EnquiryForm } from '@/components/storefront/EnquiryForm'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { PriceDisplay } from '@/components/storefront/PriceDisplay';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data: product } = await supabase.from('products').select('name').eq('slug', slug).single()
  
  if (!product) return {}

  return {
    title: `Enquire about ${product.name} | SHAHI`,
    description: `Submit an enquiry for ${product.name}.`,
  }
}

export default async function EnquiryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: product } = await supabase
    .from('products')
    .select('id, name, is_enquiry_only, price, product_images(url, is_primary)')
    .eq('slug', slug)
    .single()

  if (!product || !product.is_enquiry_only) {
    notFound()
  }

  const supabaseAuth = await createClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()
  
  let profile = null
  if (session) {
    const { data } = await supabaseAuth
      .from('profiles')
      .select('full_name, phone')
      .eq('id', session.user.id)
      .single()
    profile = data
  }

  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-32">
      <div className="bg-[#F8F9FA] py-8 md:py-16 px-4 text-center rounded-b-3xl md:rounded-b-[3rem] mb-6 md:mb-12 shadow-sm md:shadow-none relative">
        <div className="absolute left-4 sm:left-8 top-8 md:top-16">
          <Link href={`/product/${slug}`} className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#FF7A00] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-1 md:mb-4 leading-none">
          REQUEST DETAILS
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-md mx-auto">
          Please provide your details below. Our luxury consultants will assist you personally.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <div className="lg:col-span-4 lg:col-start-9 order-1 lg:order-2">
            <div className="bg-white sm:bg-[#F8F9FA] p-0 sm:p-6 rounded-none sm:rounded-[2rem] border-0 sm:border border-gray-100 flex flex-row lg:flex-col items-center lg:items-start gap-4 sm:gap-0 w-full">
              {primaryImage && (
                <div className="w-20 sm:w-full h-24 sm:h-48 rounded-xl sm:rounded-[1.5rem] overflow-hidden sm:mb-6 shrink-0 relative bg-gray-50 border border-gray-100">
                  <img src={primaryImage} alt={product.name} className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-sm sm:text-lg font-black uppercase tracking-widest text-gray-900 mb-1 sm:mb-2">{product.name}</h2>
                <div className="flex lg:flex-col items-center lg:items-start gap-2 lg:gap-1">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">Starting from</p>
                  <p className="text-lg sm:text-2xl font-black text-[#FF7A00]"><PriceDisplay amount={product.price} /></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8 lg:col-start-1 order-2 lg:order-1">
            {session ? (
              <EnquiryForm 
                productId={product.id} 
                productName={product.name} 
                userId={session.user.id}
                defaultName={profile?.full_name || ''}
                defaultPhone={profile?.phone || ''}
              />
            ) : (
              <div className="bg-white p-8 md:p-12 text-center rounded-[2rem] border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-gray-900 mb-4">Login Required</h3>
                <p className="text-xs md:text-sm font-medium text-gray-500 mb-8 max-w-sm">
                  You must be logged in to submit an enquiry. This helps us serve you better and allows you to track your enquiries directly from your account.
                </p>
                <div className="w-full sm:w-3/4 mx-auto">
                  <GoogleLoginButton nextParam={`/product/${slug}/enquiry`} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
