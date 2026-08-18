import { createAdminClient } from '@/lib/supabase/server'
import { MessageSquare, Calendar } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { EnquiryActions } from '@/components/admin/EnquiryActions'
import { EnquiryMessageModal } from '@/components/admin/EnquiryMessageModal'

export default async function AdminEnquiriesPage() {
  const supabase = createAdminClient()
  
  const { data: enquiries } = await supabase
    .from('product_enquiries')
    .select('*, products(name, slug)')
    .is('product_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#09090B]">Concierge Messages</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Manage general concierge requests and contact messages.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-200 hover:bg-transparent">
              <TableHead className="text-gray-500 font-semibold text-xs">Customer</TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs">Location</TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs">Product</TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs">Status & Actions</TableHead>
              <TableHead className="text-right text-gray-500 font-semibold text-xs">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries?.map((enquiry) => (
              <TableRow key={enquiry.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell>
                  <div className="font-semibold text-[#09090B] text-sm">
                    {enquiry.full_name}
                  </div>
                  <div className="text-gray-500 font-medium text-xs mt-1">
                    {enquiry.phone_number}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 font-medium text-sm">
                  {enquiry.state}, {enquiry.country}
                </TableCell>
                <TableCell>
                  {enquiry.products?.name ? (
                     <Link href={`/product/${enquiry.products.slug}`} target="_blank" className="text-[#FF7A00] hover:underline font-medium text-sm">
                       {enquiry.products.name}
                     </Link>
                  ) : (
                     <span className="text-gray-400 font-medium text-sm">{enquiry.product_id ? 'Deleted Product' : 'Concierge Service'}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <EnquiryActions 
                      enquiryId={enquiry.id} 
                      currentStatus={enquiry.status} 
                      phone={enquiry.phone_number} 
                    />
                    <EnquiryMessageModal 
                      name={enquiry.full_name}
                      phone={enquiry.phone_number}
                      message={enquiry.message}
                      date={new Date(enquiry.created_at).toLocaleDateString()}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right text-gray-500 font-medium text-sm">
                  {new Date(enquiry.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {!enquiries?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500 font-medium text-sm">
                  No enquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {enquiries?.map((enquiry) => (
          <div key={enquiry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4 relative">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                <MessageSquare className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-semibold text-[#09090B] text-sm truncate">{enquiry.full_name}</h3>
                <div className="text-xs text-[#FF7A00] mt-1 font-medium truncate">
                  {enquiry.products?.name || (enquiry.product_id ? 'Deleted Product' : 'Concierge Service')}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  {enquiry.phone_number} | {enquiry.state}, {enquiry.country}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs font-medium text-gray-500">
                <Calendar className="w-3 h-3 mr-2" /> {new Date(enquiry.created_at).toLocaleDateString()}
              </div>
              <EnquiryActions 
                enquiryId={enquiry.id} 
                currentStatus={enquiry.status} 
                phone={enquiry.phone_number} 
              />
            </div>
          </div>
        ))}
        {!enquiries?.length && (
          <div className="p-8 text-center text-sm font-medium text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            No enquiries found.
          </div>
        )}
      </div>
    </div>
  )
}
