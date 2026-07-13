'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteBlog } from '@/lib/actions/blog'

export function DeleteBlogButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return
    
    setIsDeleting(true)
    const res = await deleteBlog(id)
    setIsDeleting(false)
    
    if (!res.success) {
      alert('Failed to delete blog: ' + res.error)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-full"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}
