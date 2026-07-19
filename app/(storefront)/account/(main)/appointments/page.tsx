import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Calendar } from 'lucide-react'

export const metadata = {
  title: 'My Appointments | SHAHI',
  description: 'Track your product enquiries.',
}

export default async function EnquiriesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: enquiries } = await supabase
    .from('product_enquiries')
    .select(`
      id,
      status,
      created_at,
      products (
        name,
        slug,
        product_images (url, is_primary)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-gray-900">
          My Appointments
        </h2>
      </div>

      {!enquiries?.length ? (
        <div className="bg-white p-8 md:p-12 text-center rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">
            No enquiries yet
          </p>
          <p className="text-xs text-gray-400 max-w-sm mb-6">
            You haven't made any product enquiries. Explore our collection and request details for exclusive pieces.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#1C1C1C] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF7A00] transition-colors"
          >
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {enquiries.map((enquiry: any) => {
            const product = enquiry.products
            const primaryImage = product?.product_images?.find((img: any) => img.is_primary)?.url || product?.product_images?.[0]?.url

            return (
              <div 
                key={enquiry.id}
                className="bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 relative overflow-hidden"
              >
                {/* Product Image */}
                {primaryImage ? (
                  <div className="w-full sm:w-32 h-40 sm:h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <img src={primaryImage} alt={product?.name || 'Product'} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full sm:w-32 h-40 sm:h-32 bg-gray-50 rounded-xl shrink-0 border border-gray-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Image</span>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black ${
                      enquiry.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-transparent' : 
                      enquiry.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-transparent' :
                      enquiry.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-transparent' :
                      'bg-gray-100 text-gray-800 border-transparent'
                    }`}>
                      {enquiry.status}
                    </Badge>
                    <div className="flex items-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Link href={`/product/${product?.slug}`} className="group">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-gray-900 group-hover:text-[#FF7A00] transition-colors mb-2 line-clamp-2">
                      {product?.name || 'Deleted Product'}
                    </h3>
                  </Link>

                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-auto">
                    {enquiry.status === 'PENDING' ? 'Awaiting response from our team' :
                     enquiry.status === 'ACCEPTED' ? 'Our team will contact you shortly' : 
                     'Enquiry closed'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
