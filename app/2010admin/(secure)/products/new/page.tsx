import { createAdminClient } from '@/lib/supabase/server'
import { NewProductFlow } from '@/components/admin/NewProductFlow'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase.from('categories').select('id, name')

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/2010admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Product</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new product to your inventory.</p>
        </div>
      </div>
      <NewProductFlow categories={categories || []} />
    </div>
  )
}
