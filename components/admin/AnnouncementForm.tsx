'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAnnouncement, updateAnnouncement } from '@/lib/actions/announcements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function AnnouncementForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    let result;
    if (initialData?.id) {
      result = await updateAnnouncement(initialData.id, formData)
    } else {
      result = await createAnnouncement(formData)
    }

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/2010admin/announcements')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border shadow-sm">
      {error && <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="title">Internal Title</Label>
        <Input id="title" name="title" required defaultValue={initialData?.title} placeholder="e.g., Summer Sale 2026" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Text content</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description} rows={3} placeholder="The main text shown in the announcement..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" name="image_url" defaultValue={initialData?.image_url} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="action_text">Button Text</Label>
          <Input id="action_text" name="action_text" defaultValue={initialData?.action_text} placeholder="Shop Now" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="action_link">Button Link</Label>
          <Input id="action_link" name="action_link" defaultValue={initialData?.action_link} placeholder="/category/sale" />
        </div>
      </div>

      <div className="space-y-2 border-t pt-6 mt-6">
        <Label htmlFor="display_type">Display Type</Label>
        <select id="display_type" name="display_type" defaultValue={initialData?.display_type || 'GLOBAL_BANNER'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="GLOBAL_BANNER">Global Top Banner (All pages)</option>
          <option value="HOME_POPUP">Homepage Popup (Modal)</option>
          <option value="CHECKOUT_NOTICE">Checkout Notice (Inline)</option>
          <option value="CORNER_TOAST">Corner Slide-in (Toast)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date (Optional)</Label>
          <Input id="start_date" name="start_date" type="datetime-local" defaultValue={initialData?.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input id="end_date" name="end_date" type="datetime-local" defaultValue={initialData?.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : ''} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t pt-6 mt-6">
        <input type="checkbox" id="is_active" name="is_active" value="true" defaultChecked={initialData?.is_active} className="w-4 h-4 rounded border-gray-300" />
        <Label htmlFor="is_active">Active (Visible to customers)</Label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push('/2010admin/announcements')}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white">
          {loading ? 'Saving...' : 'Save Announcement'}
        </Button>
      </div>
    </form>
  )
}
