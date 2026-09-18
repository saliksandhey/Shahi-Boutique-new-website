'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { sendLoginOTP, verifyLoginOTP, completeCustomerProfile } from '@/lib/actions/auth-email'
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, RefreshCw, Mail, User, Phone, Sparkles, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function PasswordlessAuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const nextParam = searchParams.get('next') || '/'

  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [error, setError] = useState<string | null>(errorParam)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const currentOtp = otpDigits.join('')

  // 60-second Resend countdown timer
  useEffect(() => {
    let timer: any
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCountdown])

  // Focus first digit box when moving to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 150)
    }
  }, [step])

  // Handle individual digit input
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '')
    const newDigits = [...otpDigits]

    if (!clean) {
      newDigits[index] = ''
      setOtpDigits(newDigits)
      return
    }

    const digit = clean.slice(-1)
    newDigits[index] = digit
    setOtpDigits(newDigits)
    setError(null)

    if (index < 3 && digit) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle clipboard paste of 4 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pasted[i] || ''
      }
      setOtpDigits(newDigits)
      setError(null)
      const targetFocus = Math.min(pasted.length, 3)
      inputRefs.current[targetFocus]?.focus()
    }
  }

  // STEP 1: Send Login OTP
  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailVal = (formData.get('email') as string)?.trim().toLowerCase()
    setEmail(emailVal)

    try {
      const res = await sendLoginOTP(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setStep('otp')
        setOtpDigits(['', '', '', ''])
        setResendCountdown(60)
        setMessage('A 4-digit code has been sent to your email.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // STEP 2 RESEND: Resend Login OTP
  async function handleResendCode() {
    if (resendCountdown > 0 || isResending || !email) return
    setIsResending(true)
    setError(null)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('email', email)
      const res = await sendLoginOTP(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setResendCountdown(60)
        setOtpDigits(['', '', '', ''])
        inputRefs.current[0]?.focus()
        setMessage('A fresh 4-digit code has been sent to your email.')
      }
    } catch {
      setError('Failed to resend code.')
    } finally {
      setIsResending(false)
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    if (currentOtp.length !== 4) {
      setError('Please enter all 4 digits.')
      return
    }

    setError(null)
    setMessage(null)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('otp', currentOtp)

    try {
      const res = await verifyLoginOTP(formData)
      if (res.error) {
        setError(res.error)
      } else if (res.requiresProfile) {
        // First-time user or missing profile details -> Show Step 3
        if (res.existingName) setName(res.existingName)
        if (res.existingPhone) setPhone(res.existingPhone)
        setStep('profile')
        setMessage('Code verified! Please complete your profile to finish.')
      } else {
        // Existing user with complete profile -> Direct Login!
        setMessage('Signed in successfully! Entering store...')
        router.push(nextParam)
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  // STEP 3: Complete Profile (Name & Phone) For New Users
  async function handleCompleteProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('email', email)

    try {
      const res = await completeCustomerProfile(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setMessage('Profile created! Entering store...')
        router.push(nextParam)
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Sleek Step Indicator - 2 Steps Upfront */}
      <div className="mb-5 sm:mb-6">
        {step !== 'profile' ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2">
              <div className={`transition-colors truncate ${step === 'email' ? 'text-[#FF7A00] font-black' : 'text-gray-900'}`}>
                01. Email
              </div>
              <div className={`transition-colors truncate ${step === 'otp' ? 'text-[#FF7A00] font-black' : 'text-gray-300'}`}>
                02. 4-Digit Code
              </div>
            </div>
            <div className="h-1 sm:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[#111111] transition-all duration-500 rounded-full"
                style={{
                  width: step === 'email' ? '50%' : '100%'
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 animate-in fade-in duration-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A00] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              New Account Onboarding
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
              Quick Profile
            </span>
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="text-left mb-5 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wider uppercase text-gray-900 mb-1.5 leading-tight">
          {step === 'email' && 'Welcome to Shahi'}
          {step === 'otp' && 'Verify 4-Digit Code'}
          {step === 'profile' && 'Complete Profile'}
        </h2>
        <div className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
          {step === 'email' && 'Sign in or create your bespoke account with a secure instant code.'}
          {step === 'otp' && (
            <div>
              <span>We sent a 4-digit code to </span>
              <strong className="text-gray-900 font-bold break-all">{email}</strong>
              <div className="mt-1">
                <button 
                  type="button" 
                  onClick={() => { setStep('email'); setError(null); setMessage(null); }}
                  className="text-[#FF7A00] underline font-bold hover:text-black cursor-pointer text-xs inline-flex items-center gap-1"
                >
                  Change Email Address
                </button>
              </div>
            </div>
          )}
          {step === 'profile' && 'Please provide your name and phone number for order updates & bespoke fittings.'}
        </div>
      </div>

      {/* Status Banners */}
      {error && (
        <div className="mb-4 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
          <span className="text-red-500 font-bold text-sm shrink-0">⚠</span>
          <span className="leading-snug">{error}</span>
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="leading-snug">{message}</span>
        </div>
      )}

      {/* STEP 1: EMAIL INPUT */}
      {step === 'email' && (
        <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Email Address
            </Label>
            <div className="relative">
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-full h-12 sm:h-13 px-5 pl-11 border-gray-200 focus:border-[#111111] focus:ring-2 focus:ring-black/5 w-full text-sm font-medium bg-gray-50/50 focus:bg-white transition-all" 
                placeholder="name@example.com" 
                autoFocus
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full rounded-full h-12 sm:h-13 bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Continue with Email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <div className="my-4 sm:my-5 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <span className="bg-white px-3 text-gray-400">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton nextParam={nextParam} />

          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Passwordless &amp; Secure
            </span>
          </div>
        </form>
      )}

      {/* STEP 2: 4 INDIVIDUAL DIGIT OTP BOXES */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-5 sm:space-y-6">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Enter 4-Digit Code
              </Label>
              <span className="text-[10px] sm:text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Valid 5 min
              </span>
            </div>

            {/* 4 Separate Luxury Digit Boxes */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 pt-1 pb-1">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-full aspect-square max-w-[72px] mx-auto text-center text-2xl sm:text-3xl font-mono font-black rounded-xl sm:rounded-2xl border-2 transition-all outline-none ${
                    digit 
                      ? 'border-[#111111] bg-gray-50 text-gray-900 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:border-[#FF7A00] focus:ring-4 focus:ring-[#FF7A00]/15'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || currentOtp.length !== 4} 
            className="w-full rounded-full h-12 sm:h-13 bg-[#111111] hover:bg-[#FF7A00] text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Resend OTP Section */}
          <div className="text-center pt-1 sm:pt-2">
            {resendCountdown > 0 ? (
              <p className="text-xs text-gray-400 font-medium">
                Resend code in <strong className="text-gray-700 font-bold">{resendCountdown}s</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-xs font-bold text-[#FF7A00] hover:text-black uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending New Code...</span>
                  </>
                ) : (
                  <span>Didn't receive code? Resend Code</span>
                )}
              </button>
            )}
          </div>
        </form>
      )}

      {/* STEP 3: SMART PROFILE ONBOARDING (ONLY FOR NEW CUSTOMERS) */}
      {step === 'profile' && (
        <form onSubmit={handleCompleteProfile} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Full Name
            </Label>
            <div className="relative">
              <Input 
                id="name" 
                name="name" 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-full h-12 sm:h-13 px-5 pl-11 border-gray-200 focus:border-[#111111] focus:ring-2 focus:ring-black/5 text-sm bg-gray-50/50 focus:bg-white transition-all" 
                placeholder="e.g. Alisha Khan" 
                autoFocus
              />
              <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Mobile Number
            </Label>
            <div className="relative">
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="rounded-full h-12 sm:h-13 px-5 pl-11 border-gray-200 focus:border-[#111111] focus:ring-2 focus:ring-black/5 text-sm bg-gray-50/50 focus:bg-white transition-all" 
                placeholder="e.g. +91 98765 43210" 
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full rounded-full h-12 sm:h-13 bg-[#111111] hover:bg-[#FF7A00] text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Profile &amp; Enter</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] lg:bg-white flex flex-col lg:flex-row">
      {/* 1. DESKTOP LEFT EDITORIAL SHOWCASE (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#121212] min-h-screen">
        <Image 
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80"
          alt="Shahi Haute Couture"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
        
        {/* Brand Header */}
        <div className="absolute top-12 left-12 z-10">
          <Link href="/" className="inline-block group">
            <div className="relative w-[190px] h-[48px]">
              <Image 
                src="/logo.png" 
                alt="SHAHI BOUTIQUE" 
                fill 
                className="object-contain object-left brightness-0 invert group-hover:opacity-80 transition-opacity"
                quality={100}
                unoptimized
                priority
              />
            </div>
          </Link>
        </div>

        {/* Editorial Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-20 text-white z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
              The Royal Couture House
            </span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-serif font-black uppercase tracking-wider mb-4 leading-tight">
            Instant Access,<br />Timeless Elegance.
          </h1>
          <p className="text-sm xl:text-base font-normal text-white/70 max-w-md leading-relaxed">
            Sign in effortlessly with our fast 4-digit one-time code to view bespoke collections, bridal wishlists, and track orders worldwide.
          </p>
        </div>
      </div>

      {/* 2. MOBILE TOP HERO BANNER (Visible on mobile only) */}
      <div className="lg:hidden relative h-48 sm:h-56 w-full bg-[#121212] overflow-hidden shrink-0">
        <Image 
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80"
          alt="Shahi Haute Couture"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#121212]" />
        
        {/* Mobile Top Navigation Bar */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-20">
          <Link href="/" className="inline-block">
            <div className="relative w-[145px] h-[36px]">
              <Image 
                src="/logo.png" 
                alt="SHAHI BOUTIQUE" 
                fill 
                className="object-contain object-left brightness-0 invert"
                quality={100}
                unoptimized
                priority
              />
            </div>
          </Link>

          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store</span>
          </Link>
        </div>

        {/* Mobile Banner Subtitle */}
        <div className="absolute bottom-8 left-4 right-4 z-20 flex flex-col items-start">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#FF7A00]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">
              Royal Couture Pass
            </span>
          </div>
          <p className="text-white text-sm font-serif font-bold tracking-wide">
            Haute Couture • Bridal • Bespoke Luxury
          </p>
        </div>
      </div>

      {/* 3. MAIN FORM CONTAINER (Elevated App Sheet on Mobile, Right Column on Desktop) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between -mt-6 lg:mt-0 bg-white rounded-t-[28px] sm:rounded-t-[32px] lg:rounded-none px-5 sm:px-10 lg:px-16 xl:px-24 pt-7 sm:pt-10 pb-8 lg:py-16 shadow-2xl lg:shadow-none relative z-10 min-h-[calc(100vh-170px)] lg:min-h-screen">
        {/* Top Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between pb-6">
          <Link href="/" className="relative w-[150px] h-[38px] block">
            <Image 
              src="/logo.png" 
              alt="SHAHI BOUTIQUE" 
              fill 
              className="object-contain object-left"
              quality={100}
              unoptimized
            />
          </Link>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Store
          </Link>
        </div>

        {/* Form Center Area */}
        <div className="my-auto py-2 sm:py-6">
          <Suspense fallback={<div className="h-40 flex items-center justify-center font-bold uppercase tracking-widest text-xs text-gray-400">Loading Secure Portal...</div>}>
            <PasswordlessAuthForm />
          </Suspense>
        </div>

        {/* Footer info */}
        <div className="text-center pt-6 border-t border-gray-100 lg:border-none">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Shahi Boutique — Bespoke Bridal &amp; Festive Couture
          </p>
        </div>
      </div>
    </div>
  )
}

