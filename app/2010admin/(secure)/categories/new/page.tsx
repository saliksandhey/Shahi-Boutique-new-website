import { CategoryForm } from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Category</h1>
        <p className="mt-1 text-sm text-gray-500">Add a new category to organize your products.</p>
      </div>
      <CategoryForm />
    </div>
  )
}
