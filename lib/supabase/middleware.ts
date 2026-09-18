import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-fallback-secret-for-dev'
)

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Admin routes logic (Decoupled from Supabase, now using explicit admin_token)
  if (pathname.startsWith('/2010admin')) {
    return supabaseResponse
  }

  // Check if customer is authenticated via Supabase auth OR custom shahi_session cookie
  let isAuthenticated = Boolean(user && user.email)

  if (!isAuthenticated) {
    const customToken = request.cookies.get('shahi_session')?.value
    if (customToken) {
      try {
        const { payload } = await jwtVerify(customToken, JWT_SECRET)
        if (payload && payload.email) {
          isAuthenticated = true
        }
      } catch {
        // Token invalid or expired
      }
    }
  }

  // Protected customer routes logic
  if (!isAuthenticated) {
    if (
      pathname.startsWith('/account') ||
      pathname.startsWith('/orders')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

