'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { loginWithEmail, signupWithEmail } from '@/lib/actions/auth-email'
import Link from 'next/link'
import Image from 'next/image'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const nextParam = searchParams.get('next') || '/'
  
  const [error, setError] = useState<string | null>(errorParam)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      if (isSignUp) {
        const res = await signupWithEmail(formData)
        if (res.error) {
          setError(res.error)
        } else if (res.requireVerification) {
          setMessage("Account created successfully! Please check your email to verify your account before logging in.")
          e.currentTarget.reset()
          setIsSignUp(false)
        } else {
          router.push(nextParam)
          router.refresh()
        }
      } else {
        const res = await loginWithEmail(formData)
        if (res.error) {
          setError(res.error)
        } else {
          router.push(nextParam)
          router.refresh()
        }
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
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          {isSignUp ? 'Enter your details to create an account.' : 'Sign in to access your account.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</Label>
            {!isSignUp && (
              <Link 
                href="/forgot-password"
                className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] hover:text-[#111111] transition-colors"
              >
                Forgot?
              </Link>
            )}
          </div>
          <Input id="password" name="password" type="password" required className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111]" placeholder="••••••••" minLength={6} />
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-xs font-bold uppercase tracking-widest text-gray-500">Confirm Password</Label>
            <Input id="confirm_password" name="confirm_password" type="password" required className="rounded-full h-12 px-6 border-gray-200 focus:border-[#111111]" placeholder="••••••••" minLength={6} />
          </div>
        )}

        {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
        {message && <p className="text-xs font-bold text-green-600 text-center">{message}</p>}

        <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
          {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>

        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Account'}
          </button>
        </div>
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
