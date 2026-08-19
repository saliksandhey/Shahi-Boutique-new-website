'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function GoogleLoginButton({ nextParam = '/' }: { nextParam?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${nextParam}`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Button 
        type="button" 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white text-gray-900 border border-gray-300 rounded-full sm:rounded-none h-12 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
          <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
          <path d="M5.26498 14.2949C5.02498 13.5699 4.87998 12.7999 4.87998 12.0049C4.87998 11.2099 5.01998 10.4399 5.26498 9.71497L1.275 6.61997C0.465 8.22997 0 10.0599 0 12.0049C0 13.9499 0.465 15.7799 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
          <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87037 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.31037 24.0001 12.0004 24.0001Z" fill="#34A853"/>
        </svg>
        <span className="font-semibold tracking-wide text-xs uppercase">Continue with Google</span>
      </Button>

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 border border-red-200 mt-4 rounded-xl">{error}</p>}
    </div>
  )
}
