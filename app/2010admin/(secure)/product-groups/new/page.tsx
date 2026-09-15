import { getAllProductsForPicker } from '@/lib/actions/product-groups'
import { ProductGroupForm } from '@/components/admin/ProductGroupForm'

export default async function NewProductGroupPage() {
  const allProducts = await getAllProductsForPicker()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl md:text-4xl font-heading font-black tracking-widest text-gray-900 uppercase">New Product Group</h1>
        <p className="mt-1 text-xs text-gray-500 font-bold uppercase tracking-widest">Group products as color variants — they will appear on each other's product pages.</p>
      </div>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <ProductGroupForm allProducts={allProducts as any} group={null} />
      </div>
    </div>
  )
}
