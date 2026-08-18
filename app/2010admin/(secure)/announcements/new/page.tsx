import { AnnouncementForm } from '@/components/admin/AnnouncementForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/2010admin/announcements" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">New Announcement</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new banner, popup or notice.</p>
        </div>
      </div>
      
      <AnnouncementForm />
    </div>
  )
}
