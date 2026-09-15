import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/checkout'
  
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })

    if (error || !data?.url) {
      console.error('Google OAuth initialization error:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error?.message || 'Google authentication failed')}`)
    }

    return NextResponse.redirect(data.url)
  } catch (err: any) {
    console.error('Unexpected error during Google OAuth route:', err)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err?.message || 'Authentication error')}`)
  }
}
