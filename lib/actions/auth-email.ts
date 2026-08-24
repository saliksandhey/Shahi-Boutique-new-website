'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
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

  const adminClient = await createAdminClient()
  const { data: profile } = await adminClient.from('customer_profiles').select('id, name').eq('id', data.user.id).single()
  
  if (!profile) {
    await adminClient.from('customer_profiles').upsert({ id: data.user.id, email: email, name: '' })
  }

  await createSession(email)
  return { success: true }
}

export async function signupWithEmail(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!name || !email || !password) return { error: 'Name, email, and password are required.' }
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

  if (data.user) {
    const adminClient = await createAdminClient()
    
    // Update profiles tables with name
    await adminClient.from('customer_profiles').upsert({ id: data.user.id, email: email, name: name.trim(), full_name: name.trim() })
    await adminClient.from('profiles').upsert({ id: data.user.id, full_name: name.trim() })

    if (data.session) {
      await createSession(email)
      return { success: true, requireVerification: false }
    }
  }

  return { success: true, requireVerification: true }
}

export async function sendPasswordResetOTP(formData: FormData) {
  const email = formData.get('email') as string
  if (!email || !email.includes('@')) return { error: 'Invalid email address.' }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
       return { error: 'Email limit reached. Please try again later.' }
    }
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyPasswordResetOTP(formData: FormData) {
  const email = formData.get('email') as string
  const otp = formData.get('otp') as string

  if (!email || !otp) return { error: 'Email and code are required.' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'recovery'
  })

  if (error) {
    return { error: 'Invalid or expired code. Please try again.' }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
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

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { destroySession } = await import('@/lib/auth')
  await destroySession()
}
