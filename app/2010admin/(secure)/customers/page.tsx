import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminCustomersPage() {
  const supabase = createAdminClient()
  const { data: customers } = await supabase
    .from('customer_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Customers</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage registered and guest customers.</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Name</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Email</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Phone</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Joined</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="font-black text-gray-900 uppercase tracking-widest text-xs">
                  {customer.name || 'No Name'}
                </TableCell>
                <TableCell className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{customer.email}</TableCell>
                <TableCell className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{customer.phone || '-'}</TableCell>
                <TableCell className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  {new Date(customer.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild className="hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full transition-colors h-8 w-8">
                    <Link href={`/2010admin/customers/${customer.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!customers?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {customers?.map((customer) => (
          <div key={customer.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#1C1C1C] flex items-center justify-center shrink-0 shadow-sm">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest truncate">{customer.name || 'No Name'}</h3>
                <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold truncate">{customer.email}</div>
                {customer.phone && <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">{customer.phone}</div>}
              </div>
            </div>
            
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-400 hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full transition-colors">
                <Link href={`/2010admin/customers/${customer.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Joined {new Date(customer.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {!customers?.length && (
          <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            No customers found.
          </div>
        )}
      </div>
    </div>
  )
}
