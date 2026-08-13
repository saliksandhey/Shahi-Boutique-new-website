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

  const supabaseAdmin = createAdminClient()
  const ssrSupabase = await createClient()

  let cleanPhone = phone.replace(/[^0-9+]/g, '')
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone
  }
  
  const dummyEmail = `${cleanPhone.replace('+', '')}@shahi.in`

  // 1. Always try to sign in first
  const { data: signInData, error: signInError } = await ssrSupabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  })

  if (signInData.user) {
    // User signed in successfully. Verify their profile exists.
    const { data: profile } = await supabaseAdmin
      .from('customer_profiles')
      .select('id, name')
      .eq('id', signInData.user.id)
      .single()

    if (!profile) {
      // Profile is missing (maybe deleted during dev). Create it now.
      await supabaseAdmin.from('customer_profiles').upsert({
        id: signInData.user.id,
        email: dummyEmail,
        name: '', 
        phone: cleanPhone,
      })
      await createSession(dummyEmail)
      return { success: true, isNewUser: true }
    } else {
      await createSession(dummyEmail)
      // Check if they never completed onboarding (name is empty)
      const isNew = !profile.name || profile.name.trim() === ''
      return { success: true, isNewUser: isNew }
    }
  }

  // 2. If signIn failed, it could be wrong password OR new user. Try to sign up.
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password,
    email_confirm: true,
  })

  if (adminError) {
    if (adminError.message.includes('already been registered') || adminError.status === 422) {
      // User exists in auth.users, so the earlier sign in failed due to WRONG PASSWORD.
      return { error: 'Incorrect password.' }
    }
    return { error: adminError.message }
  }

  // 3. Signup successful! Sign them in to set browser cookies.
  if (adminData.user) {
    const { data: newSignInData, error: newSignInError } = await ssrSupabase.auth.signInWithPassword({
      email: dummyEmail,
      password,
    })

    if (newSignInError) {
      return { error: 'Account created but failed to log in automatically.' }
    }
    
    await supabaseAdmin.from('customer_profiles').upsert({
      id: adminData.user.id,
      email: dummyEmail,
      name: '', // Empty name indicates they need onboarding
      phone: cleanPhone,
    })

    await createSession(dummyEmail)
    return { success: true, isNewUser: true }
  }

  return { error: 'Failed to sign up' }
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
