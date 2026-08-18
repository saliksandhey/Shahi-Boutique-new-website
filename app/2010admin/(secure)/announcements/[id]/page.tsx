import { AnnouncementForm } from '@/components/admin/AnnouncementForm'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const supabase = createAdminClient()
  
  const { data: announcement } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', p.id)
    .single()

  if (!announcement) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/2010admin/announcements" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Announcement</h1>
          <p className="mt-1 text-sm text-gray-500">Update the banner, popup or notice settings.</p>
        </div>
      </div>
      
      <AnnouncementForm initialData={announcement} />
    </div>
  )
}
