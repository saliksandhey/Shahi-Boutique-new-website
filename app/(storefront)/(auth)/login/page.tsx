'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { loginOrSignupWithPhone, resetPasswordWithoutOTP } from '@/lib/actions/auth-phone'
import Link from 'next/link'
import Image from 'next/image'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const nextParam = searchParams.get('next') || '/'
  
  const [error, setError] = useState<string | null>(errorParam)
  const [isLoading, setIsLoading] = useState(false)

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
      const res = await loginOrSignupWithPhone(formData)
      if (res.error) {
        setError(res.error)
      } else if (res.isNewUser) {
        router.push(`/onboarding?next=${encodeURIComponent(nextParam)}`)
        router.refresh()
      } else {
        router.push(nextParam)
        router.refresh()
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-black tracking-widest uppercase text-gray-900 mb-2">
          Welcome to SHAHI
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Enter your phone and password to sign in or create an account.
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</Label>

            <Link 
              href="/forgot-password"
              className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#111111] transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111]" placeholder="••••••••" />
        </div>

        {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
          {isLoading ? 'Processing...' : 'Continue'}
        </Button>
      </form>

      <div className="mt-8 mb-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
          <span className="bg-white px-4 text-gray-400">Or continue with</span>
        </div>
      </div>

      <GoogleLoginButton nextParam={nextParam} />


    </div>
  )
}

export default function LoginPage() {
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
          <p className="text-lg font-medium opacity-90 max-w-md">Experience bespoke luxury fashion, tailored specifically for you.</p>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">


        <Suspense fallback={<div className="h-40 flex items-center justify-center font-bold uppercase tracking-widest text-xs text-gray-500">Loading Secure Portal...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
