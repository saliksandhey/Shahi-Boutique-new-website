import { createAdminClient } from '@/lib/supabase/server'
import { Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { approveReview, rejectReview, deleteReview } from '@/lib/actions/admin-reviews'

export default async function AdminReviewsPage() {
  const supabase = createAdminClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, email), products(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Reviews</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage product reviews and ratings.</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Product</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Rating</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Comment</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews?.map((review) => (
              <TableRow key={review.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell>
                  <div className="font-black text-gray-900 text-xs uppercase tracking-widest">{(review.profiles as any)?.full_name || 'Anonymous'}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{(review.profiles as any)?.email}</div>
                </TableCell>
                <TableCell className="text-xs font-black text-gray-900 uppercase tracking-widest">{(review.products as any)?.name}</TableCell>
                <TableCell>
                  <div className="flex text-[#FF7A00]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-[#FF7A00]' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-[10px] uppercase font-bold tracking-widest text-gray-500" title={review.comment}>
                  {review.comment || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] font-bold tracking-wider uppercase shadow-sm ${review.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                    {review.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {!review.approved ? (
                      <form action={async () => { 'use server'; await approveReview(review.id); }}>
                        <Button variant="ghost" size="icon" type="submit" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors h-8 w-8" title="Approve">
                          <Check className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : (
                      <form action={async () => { 'use server'; await rejectReview(review.id); }}>
                        <Button variant="ghost" size="icon" type="submit" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full transition-colors h-8 w-8" title="Reject">
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                    <form action={async () => { 'use server'; await deleteReview(review.id); }}>
                      <Button variant="ghost" size="icon" type="submit" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors h-8 w-8" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!reviews?.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reviews?.map((review) => (
          <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-black text-gray-900 text-sm uppercase tracking-widest leading-tight">{(review.profiles as any)?.full_name || 'Anonymous'}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{(review.products as any)?.name}</div>
              </div>
              <Badge variant="outline" className={`shrink-0 shadow-sm text-[9px] font-bold tracking-wider uppercase ${review.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                {review.approved ? 'Approved' : 'Pending'}
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 mt-1">
              <div className="flex text-[#FF7A00] text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? 'text-[#FF7A00]' : 'text-gray-200'}>★</span>
                ))}
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 italic">"{review.comment}"</p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-1">
              {!review.approved ? (
                <form action={async () => { 'use server'; await approveReview(review.id); }}>
                  <Button variant="outline" size="sm" type="submit" className="rounded-full font-bold text-[10px] uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                    <Check className="h-3 w-3 mr-2" /> Approve
                  </Button>
                </form>
              ) : (
                <form action={async () => { 'use server'; await rejectReview(review.id); }}>
                  <Button variant="outline" size="sm" type="submit" className="rounded-full font-bold text-[10px] uppercase tracking-widest text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100">
                    <X className="h-3 w-3 mr-2" /> Reject
                  </Button>
                </form>
              )}
              <form action={async () => { 'use server'; await deleteReview(review.id); }}>
                <Button variant="destructive" size="sm" type="submit" className="rounded-full font-bold text-[10px] uppercase tracking-widest">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </div>
        ))}
        {!reviews?.length && (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            No reviews found.
          </div>
        )}
      </div>
    </div>
  )
}
