import { createAdminClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { SizeGuideManager } from '@/components/admin/SizeGuideManager'
import { ProductVariantsManager } from '@/components/admin/ProductVariantsManager'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient()
  
  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()
  const { data: categories } = await supabase.from('categories').select('id, name')
  const { data: images } = await supabase.from('product_images').select('*').eq('product_id', id).order('position', { ascending: true })
  const { data: sizeGuides } = await supabase.from('product_size_guides').select('*').eq('product_id', id).order('size_name', { ascending: true })
  const { data: variants } = await supabase.from('product_variants').select('*').eq('product_id', id).order('color', { ascending: true })

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto space-y-12 pb-12 mt-12 text-center text-red-500">
        <h1 className="text-2xl font-bold">Error Loading Product</h1>
        <p>Product ID: {id}</p>
        <p>Database Error: {error?.message || 'No error message provided'}</p>
        <p>Details: {error?.details || 'N/A'}</p>
        <Link href="/2010admin/products" className="underline mt-4 inline-block">Return to Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/2010admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Product: {product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all aspects of this product across the sections below.</p>
        </div>
      </div>

      <div className="space-y-4">
        <ProductForm product={product} categories={categories || []} />
      </div>

      <div className="space-y-4">
        <ProductVariantsManager productId={product.id} variants={variants || []} />
      </div>

      <div className="space-y-4">
        <ImageUpload productId={product.id} images={images || []} />
      </div>

      <div className="space-y-4">
        <SizeGuideManager productId={product.id} sizeGuides={sizeGuides || []} />
      </div>
    </div>
  )
}
