'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Shahi Boutique operates with passwordless 4-digit OTP sign-in.
        </p>
        <p className="text-xs text-gray-400">
          Redirecting to Sign-In Portal...
        </p>
      </div>
    </div>
  )
}

