'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm({ initialName, initialPhone, email }: { initialName: string, initialPhone: string, email: string }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialName,
      phone: initialPhone,
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    const formData = new FormData()
    formData.append('full_name', data.full_name)
    if (data.phone) formData.append('phone', data.phone)

    const result = await updateProfile(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Profile updated successfully.')
    }
    setSaving(false)
  }

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
        <CardTitle className="text-xl tracking-tighter">Personal Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</Label>
            <Input id="full_name" {...form.register('full_name')} className="h-12 rounded-xl bg-gray-50/50 border-gray-200" />
            {form.formState.errors.full_name && (
              <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</Label>
            <Input id="email" type="email" value={email} disabled className="h-12 rounded-xl bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 font-medium">Your email cannot be changed here.</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</Label>
            <Input id="phone" {...form.register('phone')} className="h-12 rounded-xl bg-gray-50/50 border-gray-200" />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

          <Button type="submit" disabled={saving} className="w-full h-14 rounded-full font-bold uppercase tracking-widest text-xs mt-4">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
