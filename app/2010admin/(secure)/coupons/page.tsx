import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit2, Trash2 } from 'lucide-react'
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
import { deleteCoupon } from '@/lib/actions/admin-coupons'

export default async function AdminCouponsPage() {
  const supabase = createAdminClient()
  const { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Coupons</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage discount codes.</p>
        </div>
        <Button asChild className="rounded-full bg-[#1C1C1C] text-white px-8 py-6 text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] shadow-xl transition-all duration-300 w-full sm:w-auto">
          <Link href="/2010admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Code</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Discount</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Expires</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons?.map((coupon) => (
              <TableRow key={coupon.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="font-black font-mono text-[#FF7A00] uppercase tracking-wider text-sm">{coupon.code}</TableCell>
                <TableCell className="font-bold text-gray-900">
                  {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                </TableCell>
                <TableCell className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] font-bold tracking-wider uppercase shadow-sm ${coupon.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" asChild className="hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full transition-colors h-8 w-8">
                      <Link href={`/2010admin/coupons/${coupon.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={async () => {
                      'use server'
                      await deleteCoupon(coupon.id)
                    }}>
                      <Button variant="ghost" size="icon" type="submit" className="hover:text-red-600 hover:bg-red-50 rounded-full transition-colors h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!coupons?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {coupons?.map((coupon) => (
          <div key={coupon.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="font-black font-mono text-[#FF7A00] text-xl uppercase tracking-wider">{coupon.code}</div>
              <Badge variant="outline" className={`text-[9px] font-bold tracking-wider uppercase shadow-sm ${coupon.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {coupon.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Discount</p>
                <p className="font-black text-gray-900 text-lg">{coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Expires</p>
                <p className="font-bold text-[10px] uppercase tracking-widest text-gray-900 mt-1">{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-1">
              <Button variant="outline" size="sm" asChild className="rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-[#FF7A00] hover:bg-orange-50">
                <Link href={`/2010admin/coupons/${coupon.id}/edit`}>
                  <Edit2 className="h-3 w-3 mr-2" /> Edit
                </Link>
              </Button>
              <form action={async () => {
                'use server'
                await deleteCoupon(coupon.id)
              }}>
                <Button variant="destructive" size="sm" type="submit" className="rounded-full font-bold text-[10px] uppercase tracking-widest">
                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
        {!coupons?.length && (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            No coupons found.
          </div>
        )}
      </div>
    </div>
  )
}
