import { createAdminClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const id = await params.id;
  const supabase = createAdminClient()
  const { data: category } = await supabase.from('categories').select('*').eq('id', id).single()

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Category</h1>
        <p className="mt-1 text-sm text-gray-500">Update category details.</p>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}
