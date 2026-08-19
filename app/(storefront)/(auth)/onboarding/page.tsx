'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { completeUserProfile } from '@/lib/actions/auth-email'
import Image from 'next/image'

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || '/'
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const res = await completeUserProfile(formData)
      
      if (res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        router.push(nextParam)
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="relative w-[120px] h-[30px] mx-auto mb-10">
          <Image 
            src="/logo.png" 
            alt="SHAHI BOUTIQUE" 
            fill 
            className="object-contain object-center"
            quality={100}
            unoptimized
          />
        </div>
        <h2 className="text-3xl font-serif font-black tracking-widest uppercase text-gray-900 mb-4">
          What should we call you?
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Please enter your full name to complete your profile and personalize your SHAHI experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 pl-4">Full Name</label>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            required 
            autoFocus
            className="rounded-full h-14 px-6 border-gray-200 bg-white focus:border-[#111111] focus:ring-0 text-lg shadow-sm" 
            placeholder="E.g. Alisha Khan" 
          />
        </div>

        {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full rounded-full h-14 bg-[#111111] hover:bg-[#FF7A00] text-white font-bold uppercase tracking-widest text-xs transition-all duration-500 shadow-xl hover:shadow-[#FF7A00]/20">
          {isLoading ? 'Saving...' : 'Enter the Boutique'}
        </Button>
      </form>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Split Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image 
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80"
          alt="Shahi Editorial"
          fill
          className="object-cover object-center grayscale opacity-80 mix-blend-multiply"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24 text-white">
          <h1 className="text-5xl font-serif font-black uppercase tracking-widest mb-4">WELCOME</h1>
          <p className="text-lg font-medium opacity-90 max-w-md">Join the exclusive world of SHAHI. Let's make this experience truly yours.</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-[#FAFAFA]">
        <Suspense fallback={<div className="h-40 flex items-center justify-center font-bold uppercase tracking-widest text-xs text-gray-500">Preparing...</div>}>
          <OnboardingForm />
        </Suspense>
      </div>
    </div>
  )
}

