'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { sendEmailOTP, verifyEmailOTP } from '@/lib/actions/auth-email'
import Image from 'next/image'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const nextParam = searchParams.get('next') || '/'
  
  const [error, setError] = useState<string | null>(errorParam)
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const emailVal = formData.get('email') as string
    setEmail(emailVal)
    
    try {
      const res = await sendEmailOTP(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setIsOtpSent(true)
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('email', email) // append email from state
    
    try {
      const res = await verifyEmailOTP(formData)
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
          {isOtpSent ? 'Verify Email' : 'Welcome to SHAHI'}
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          {isOtpSent ? `Enter the 6-digit code sent to ${email}` : 'Enter your email to sign in or create an account.'}
        </p>
      </div>

      {!isOtpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111] w-full" 
              placeholder="you@example.com" 
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
            {isLoading ? 'Sending Code...' : 'Continue with Email'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-widest text-gray-500">6-Digit Code</Label>
            <Input 
              id="otp" 
              name="otp" 
              type="text" 
              required 
              maxLength={6}
              className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111] text-center tracking-[0.5em] text-lg font-bold w-full" 
              placeholder="000000" 
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => { setIsOtpSent(false); setError(null); }}
              className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-widest"
            >
              Change Email
            </button>
          </div>
        </form>
      )}

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
