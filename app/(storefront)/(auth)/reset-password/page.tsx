'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/actions/auth-email'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await resetPassword(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setMessage('Password updated successfully! Redirecting...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-black tracking-widest uppercase text-gray-900 mb-2">
            New Password
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Enter your new secure password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500">New Password</Label>
            <Input id="password" name="password" type="password" required className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111]" placeholder="••••••••" minLength={6} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-xs font-bold uppercase tracking-widest text-gray-500">Confirm New Password</Label>
            <Input id="confirm_password" name="confirm_password" type="password" required className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111]" placeholder="••••••••" minLength={6} />
          </div>

          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
          {message && <p className="text-xs font-bold text-green-600 text-center">{message}</p>}

          <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
