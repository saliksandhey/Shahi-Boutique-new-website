import { getProductGroups, deleteProductGroup } from '@/lib/actions/product-groups'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default async function ProductGroupsPage() {
  const groups = await getProductGroups()

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Product Groups</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Group products as color variants — shown on product pages.</p>
        </div>
        <Button asChild className="rounded-full bg-[#1C1C1C] text-white px-8 py-6 text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] shadow-xl transition-all duration-300 w-full sm:w-auto">
          <Link href="/2010admin/product-groups/new">
            <Plus className="mr-2 h-4 w-4" /> New Group
          </Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Group Name</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Products</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group: any) => (
              <TableRow key={group.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4 text-[#FF7A00]" />
                    </div>
                    <span className="font-black text-gray-900">{group.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {group.product_group_items?.length || 0} products
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" asChild className="hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full transition-colors h-8 w-8">
                      <Link href={`/2010admin/product-groups/${group.id}/edit`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={async () => {
                      'use server'
                      await deleteProductGroup(group.id)
                    }}>
                      <Button variant="ghost" size="icon" type="submit" className="hover:text-red-600 hover:bg-red-50 rounded-full transition-colors h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!groups.length && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No groups yet. Create one to link color variants.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {groups.map((group: any) => (
          <div key={group.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5 text-[#FF7A00]" />
              </div>
              <div>
                <div className="font-black text-gray-900 uppercase tracking-widest">{group.name}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{group.product_group_items?.length || 0} products</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
              <Button variant="outline" size="sm" asChild className="rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-[#FF7A00]">
                <Link href={`/2010admin/product-groups/${group.id}/edit`}>
                  <Edit2 className="h-3 w-3 mr-2" /> Edit
                </Link>
              </Button>
              <form action={async () => {
                'use server'
                await deleteProductGroup(group.id)
              }}>
                <Button variant="destructive" size="sm" type="submit" className="rounded-full font-bold text-[10px] uppercase tracking-widest">
                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
        {!groups.length && (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            No groups yet.
          </div>
        )}
      </div>
    </div>
  )
}
