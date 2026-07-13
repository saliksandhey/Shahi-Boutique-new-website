'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCategory, updateCategory } from '@/lib/actions/admin-categories'
import { Card, CardContent } from '@/components/ui/card'

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function CategoryForm({ category }: { category?: any }) {
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      slug: category.slug
    } : {
      name: '', slug: ''
    }
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('name', e.target.value)
    if (!category && !form.getValues('slug')) {
      form.setValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setError(null)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('slug', data.slug)
    if (imageFile) {
      formData.append('imageFile', imageFile)
    }

    let res;
    if (category) {
      res = await updateCategory(category.id, formData)
    } else {
      res = await createCategory(formData)
    }

    if (res?.error) {
      setError(res.error)
    }
  }

  // Luxury UI Class Names
  const cardClass = "rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden"
  const headerClass = "text-xl font-black uppercase tracking-widest text-gray-900 border-b border-gray-50 pb-6 mb-8"
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block"
  const inputClass = "rounded-xl border-gray-200 bg-gray-50 shadow-sm focus-visible:ring-1 focus-visible:ring-[#FF7A00] focus-visible:border-[#FF7A00] hover:bg-white transition-colors"

  return (
    <Card className={cardClass}>
      <CardContent className="p-8 md:p-10">
        <h3 className={headerClass}>Category Details</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label htmlFor="name" className={labelClass}>Category Name</Label>
              <Input id="name" {...form.register('name')} onChange={handleNameChange} className={inputClass} placeholder="e.g. Sarees" />
              {form.formState.errors.name && <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2">{form.formState.errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug" className={labelClass}>URL Slug</Label>
              <Input id="slug" {...form.register('slug')} className={inputClass} placeholder="sarees" />
              {form.formState.errors.slug && <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2">{form.formState.errors.slug.message}</p>}
            </div>
          </div>

          <div>
            <Label className={labelClass}>Category Image</Label>
            {imagePreview && (
              <div className="mb-4">
                <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
              </div>
            )}
            <Input 
              type="file" 
              accept="image/*" 
              className={inputClass}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0])
                  setImagePreview(URL.createObjectURL(e.target.files[0]))
                }
              }}
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 border border-red-100 rounded-[2rem] text-[10px] font-bold tracking-widest uppercase">{error}</div>}

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="rounded-full bg-[#1C1C1C] text-white px-10 py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF7A00] shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              {form.formState.isSubmitting ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
