'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/auth'

export async function sendEmailOTP(formData: FormData) {
  const email = formData.get('email') as string
  if (!email || !email.includes('@')) return { error: 'Invalid email address.' }

  const supabase = await createClient()

  // Supabase will automatically send the OTP email using its configured SMTP server.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    }
  })

  if (error) {
    // If it fails, they likely haven't set up Custom SMTP in Supabase
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
       return { error: 'Email limit reached. Please configure Custom SMTP in Supabase.' }
    }
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyEmailOTP(formData: FormData) {
  const email = formData.get('email') as string
  const otp = formData.get('otp') as string

  if (!email || !otp) return { error: 'Email and code are required.' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email'
  })

  if (error) {
    return { error: 'Invalid or expired code. Please try again.' }
  }

  if (data.user) {
    const adminClient = await createAdminClient()
    const { data: profile } = await adminClient.from('customer_profiles').select('id, name').eq('id', data.user.id).single()
    
    if (!profile) {
      await adminClient.from('customer_profiles').insert({ id: data.user.id, email: email, name: '' })
      await createSession(email)
      return { success: true, isNewUser: true }
    } else {
      await createSession(email)
      const isNew = !profile.name || profile.name.trim() === ''
      return { success: true, isNewUser: isNew }
    }
  }

  return { error: 'Verification failed.' }
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

  const { error: customerProfileError } = await supabaseAdmin
    .from('customer_profiles')
    .update({ name: name.trim() })
    .eq('id', user.id)
    
  if (customerProfileError?.code === 'PGRST204') {
    await supabaseAdmin.from('customer_profiles').update({ full_name: name.trim() }).eq('id', user.id)
  }

  await supabaseAdmin
    .from('profiles')
    .update({ full_name: name.trim() })
    .eq('id', user.id)

  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { destroySession } = await import('@/lib/auth')
  await destroySession()
}
