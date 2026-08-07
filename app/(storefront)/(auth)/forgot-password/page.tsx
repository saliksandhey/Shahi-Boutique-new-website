'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordWithoutOTP } from '@/lib/actions/auth-phone'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string
    if (!phone.startsWith('+')) {
      formData.set('phone', '+91' + phone) // Default to India if no country code provided
    }
    
    try {
      const res = await resetPasswordWithoutOTP(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setIsSuccess(true)
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Split Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image 
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80"
          alt="Shahi Editorial"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24 text-white">
          <h1 className="text-5xl font-serif font-black uppercase tracking-widest mb-4">SHAHI</h1>
          <p className="text-lg font-medium opacity-90 max-w-md">Recover your access to bespoke luxury fashion.</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md mx-auto">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-serif font-black tracking-widest uppercase text-gray-900">
                Password Reset!
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Your password has been successfully updated. You can now use your new password to sign in.
              </p>
              <Link href="/login" className="block w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md flex items-center justify-center">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-black tracking-widest uppercase text-gray-900 mb-2">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Enter your registered phone number and a new password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-full border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                      +91
                    </span>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      required 
                      className="rounded-r-full rounded-l-none h-12 px-4 border-gray-200 focus:border-[#111111] flex-1" 
                      placeholder="98765 43210" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500">New Password</Label>
                  <Input id="password" name="password" type="password" required className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111]" placeholder="••••••••" />
                </div>

                {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

                <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#111111] transition-colors">
                  &larr; Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
