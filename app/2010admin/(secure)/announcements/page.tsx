import { getAllAnnouncements, deleteAnnouncement } from '@/lib/actions/announcements'
import Link from 'next/link'
import { Plus, Edit, Trash } from 'lucide-react'
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

export default async function AnnouncementsPage() {
  const { announcements, error } = await getAllAnnouncements()

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Announcements</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage popups, banners, and checkout notices.</p>
        </div>
        <Button asChild className="rounded-full bg-[#1C1C1C] text-white px-8 py-6 text-xs font-bold uppercase tracking-widest hover:bg-[#FF7A00] shadow-xl transition-all duration-300 w-full sm:w-auto">
          <Link href="/2010admin/announcements/new">
            <Plus className="mr-2 h-4 w-4" /> Add Announcement
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-[2rem] font-bold text-sm uppercase tracking-widest">Error: {error}</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Title</TableHead>
                  <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Type</TableHead>
                  <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                  <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Dates</TableHead>
                  <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements?.map((item: any) => (
                  <TableRow key={item.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-black text-gray-900 uppercase tracking-widest text-sm">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase shadow-sm bg-gray-50 text-gray-600 border-gray-200">
                        {item.display_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] font-bold tracking-wider uppercase shadow-sm ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                      {item.start_date && <div>Start: {new Date(item.start_date).toLocaleDateString()}</div>}
                      {item.end_date && <div>End: {new Date(item.end_date).toLocaleDateString()}</div>}
                      {!item.start_date && !item.end_date && 'Always'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" asChild className="hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full transition-colors h-8 w-8">
                          <Link href={`/2010admin/announcements/${item.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <form action={async () => {
                          'use server'
                          await deleteAnnouncement(item.id)
                        }} className="inline-block">
                          <Button variant="ghost" size="icon" type="submit" className="hover:text-red-600 hover:bg-red-50 rounded-full transition-colors h-8 w-8">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!announcements?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                      No announcements found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {announcements?.map((item: any) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-black text-gray-900 text-lg uppercase tracking-widest leading-tight">{item.title}</div>
                  <Badge variant="outline" className={`shrink-0 shadow-sm text-[9px] font-bold tracking-wider uppercase ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase shadow-sm bg-gray-50 text-gray-600 border-gray-200">
                    {item.display_type.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 mt-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Duration</p>
                  <div className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                    {item.start_date && <div>Start: {new Date(item.start_date).toLocaleDateString()}</div>}
                    {item.end_date && <div>End: {new Date(item.end_date).toLocaleDateString()}</div>}
                    {!item.start_date && !item.end_date && 'Always active'}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-1">
                  <Button variant="outline" size="sm" asChild className="rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-[#FF7A00] hover:bg-orange-50">
                    <Link href={`/2010admin/announcements/${item.id}`}>
                      <Edit className="h-3 w-3 mr-2" /> Edit
                    </Link>
                  </Button>
                  <form action={async () => {
                    'use server'
                    await deleteAnnouncement(item.id)
                  }}>
                    <Button variant="destructive" size="sm" type="submit" className="rounded-full font-bold text-[10px] uppercase tracking-widest">
                      <Trash className="h-3 w-3 mr-2" /> Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
            {!announcements?.length && (
              <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                No announcements found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
