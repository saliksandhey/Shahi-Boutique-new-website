'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordResetOTP, verifyPasswordResetOTP, updatePassword } from '@/lib/actions/auth-email'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp' | 'new-password'>('email')
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const emailVal = formData.get('email') as string
    setEmail(emailVal)
    
    try {
      const res = await sendPasswordResetOTP(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setStep('otp')
        setMessage('A 6-digit code has been sent to your email.')
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
    setMessage(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('email', email)
    
    try {
      const res = await verifyPasswordResetOTP(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setStep('new-password')
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updatePassword(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setMessage('Password updated successfully! Redirecting to login...')
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Image src="/logo.png" alt="Shahi Boutique" width={100} height={30} className="object-contain" />
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-black tracking-widest uppercase text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {step === 'email' && 'Enter your email to receive a password reset code.'}
            {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
            {step === 'new-password' && 'Enter your new secure password below.'}
          </p>
        </div>

        {step === 'email' && (
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
            {message && <p className="text-xs font-bold text-green-600 text-center">{message}</p>}

            <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        )}

        {step === 'otp' && (
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
            {message && <p className="text-xs font-bold text-green-600 text-center">{message}</p>}

            <Button type="submit" disabled={isLoading} className="w-full rounded-full h-12 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md">
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
        )}

        {step === 'new-password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
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
        )}

        <div className="text-center mt-8">
          <Link 
            href="/login"
            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
