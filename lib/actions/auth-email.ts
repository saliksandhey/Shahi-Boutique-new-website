'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/auth'

export async function loginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure they have a profile
  const adminClient = await createAdminClient()
  const { data: profile } = await adminClient.from('customer_profiles').select('id').eq('email', email).single()
  if (!profile) {
    await adminClient.from('customer_profiles').insert({ email })
  }

  // Create JWT session for old fallback
  await createSession(email)
  
  return { success: true }
}

export async function signupWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!email || !password) return { error: 'Email and password are required.' }
  if (password !== confirmPassword) return { error: 'Passwords do not match.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is enabled, user might not have a session right away
  if (data.session) {
    const adminClient = await createAdminClient()
    const { data: profile } = await adminClient.from('customer_profiles').select('id').eq('email', email).single()
    if (!profile) {
      await adminClient.from('customer_profiles').insert({ email })
    }
    await createSession(email)
    return { success: true, requireVerification: false }
  }

  return { success: true, requireVerification: true }
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) return { error: 'Email is required.' }

  const supabase = await createClient()
  
  // Replace this manually with NEXT_PUBLIC_SITE_URL later
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password !== confirmPassword) return { error: 'Passwords do not match.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
export async function completeUserProfile(formData: FormData) {
  const name = formData.get('name') as string

  if (!name || name.trim().length === 0) {
    return { error: 'Please enter your name.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const supabaseAdmin = createAdminClient()

  // Update customer_profiles table (uses 'name' column)
  const { error: customerProfileError } = await supabaseAdmin
    .from('customer_profiles')
    .update({ name: name.trim() })
    .eq('id', user.id)
    
  // Also try updating full_name just in case they added it recently or it's in the schema cache
  if (customerProfileError?.code === 'PGRST204') {
    await supabaseAdmin.from('customer_profiles').update({ full_name: name.trim() }).eq('id', user.id)
  }

  // Also update the main 'profiles' table which uses 'full_name'
  await supabaseAdmin
    .from('profiles')
    .update({ full_name: name.trim() })
    .eq('id', user.id)

  if (customerProfileError && customerProfileError.code !== 'PGRST204') {
    console.error("Profile update error:", customerProfileError)
    return { error: 'Failed to update profile.' }
  }

  return { success: true }
}
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { destroySession } = await import('@/lib/auth')
  await destroySession()
}
