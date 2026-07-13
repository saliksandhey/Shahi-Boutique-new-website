'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const nextParam = searchParams.get('next') || '/'
  
  const [error, setError] = useState<string | null>(errorParam)

  return (
    <div>
      <h2 className="mt-6 text-2xl font-serif tracking-widest uppercase text-gray-900">
        Welcome Back
      </h2>
      <p className="mt-2 text-sm text-gray-500 font-light mb-8">
        Sign in to access your orders and faster checkout.
      </p>

      {/* Google Login Button */}
      <GoogleLoginButton nextParam={nextParam} />

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 border border-red-200 mt-4">{error}</p>}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading secure login...</div>}>
      <LoginForm />
    </Suspense>
  )
}
