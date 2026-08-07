'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/auth'

export async function loginWithPhone(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!phone || !password) {
    return { error: 'Phone number and password are required.' }
  }

  const supabase = await createClient()
  
  // Clean phone number (ensure + is there)
  let cleanPhone = phone.replace(/[^0-9+]/g, '')
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone
  }
  
  // Convert phone to dummy email to bypass Supabase SMS Provider requirement
  const dummyEmail = `${cleanPhone.replace('+', '')}@shahi.in`

  const { data, error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    let email = dummyEmail
    await createSession(email) // Fallback for components still using old token
    return { success: true }
  }

  return { error: 'Failed to login' }
}

export async function signupWithPhone(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!phone || !password || !name) {
    return { error: 'All fields are required.' }
  }

  const supabase = createAdminClient()

  let cleanPhone = phone.replace(/[^0-9+]/g, '')
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone
  }

  // Convert phone to dummy email to bypass Supabase SMS Provider requirement
  const dummyEmail = `${cleanPhone.replace('+', '')}@shahi.in`

  // Use admin to create user and bypass email confirmation
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: dummyEmail,
    password,
    email_confirm: true,
  })

  if (adminError) {
    return { error: adminError.message }
  }

  if (adminData.user) {
    // Use SSR client to sign them in so that native Supabase cookies are set on the browser
    const ssrSupabase = await createClient()
    const { data: signInData, error: signInError } = await ssrSupabase.auth.signInWithPassword({
      email: dummyEmail,
      password,
    })

    if (signInError) {
      return { error: 'Account created but failed to log in automatically.' }
    }
    
    // Create profile
    let email = dummyEmail
    
    await supabase.from('customer_profiles').upsert({
      id: adminData.user.id,
      email: email,
      full_name: name,
      phone: cleanPhone,
    })

    await createSession(email) // Fallback token
    return { success: true }
  }

  return { error: 'Failed to sign up' }
}

export async function resetPasswordWithoutOTP(formData: FormData) {
  const phone = formData.get('phone') as string
  const newPassword = formData.get('password') as string

  if (!phone || !newPassword) {
    return { error: 'Phone number and new password are required.' }
  }

  const supabase = createAdminClient()

  let cleanPhone = phone.replace(/[^0-9+]/g, '')
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone
  }

  // Find the user by phone in our profiles table
  const { data: profile, error: profileError } = await supabase
    .from('customer_profiles')
    .select('id')
    .eq('phone', cleanPhone)
    .single()

  if (profileError || !profile) {
    return { error: 'No account found with this phone number.' }
  }

  // Update their password directly using admin privileges
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    profile.id,
    { password: newPassword }
  )

  if (updateError) {
    return { error: 'Failed to reset password. Please try again.' }
  }

  return { success: true }
}

export async function loginOrSignupWithPhone(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!phone || !password) {
    return { error: 'Phone number and password are required.' }
  }

  const supabase = createAdminClient()

  let cleanPhone = phone.replace(/[^0-9+]/g, '')
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone
  }
  
  const dummyEmail = `${cleanPhone.replace('+', '')}@shahi.in`

  // Check if user exists
  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('id')
    .eq('phone', cleanPhone)
    .single()

  if (profile) {
    // User exists, try to log in
    const ssrSupabase = await createClient()
    const { data, error } = await ssrSupabase.auth.signInWithPassword({
      email: dummyEmail,
      password,
    })

    if (error) {
      return { error: 'Incorrect password.' }
    }

    if (data.user) {
      await createSession(dummyEmail)
      return { success: true }
    }
    return { error: 'Failed to login' }
  } else {
    // User does not exist, sign them up
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: dummyEmail,
      password,
      email_confirm: true,
    })

    if (adminError) {
      return { error: adminError.message }
    }

    if (adminData.user) {
      const ssrSupabase = await createClient()
      const { data: signInData, error: signInError } = await ssrSupabase.auth.signInWithPassword({
        email: dummyEmail,
        password,
      })

      if (signInError) {
        return { error: 'Account created but failed to log in automatically.' }
      }
      
      await supabase.from('customer_profiles').upsert({
        id: adminData.user.id,
        email: dummyEmail,
        full_name: 'Guest User', // Default name, user can change later
        phone: cleanPhone,
      })

      await createSession(dummyEmail)
      return { success: true }
    }
    return { error: 'Failed to sign up' }
  }
}
