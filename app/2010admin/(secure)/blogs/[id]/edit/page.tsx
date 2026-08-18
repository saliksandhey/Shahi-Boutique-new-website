import { BlogForm } from '../../BlogForm'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!blog) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <BlogForm initialData={blog} />
    </div>
  )
}
