'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/auth'
import { sendLoginOTPEmail } from '@/lib/actions/emails'

// 1. Send 4-Digit Sign-In OTP (5 Minutes Validity)
export async function sendLoginOTP(formData: FormData) {
  try {
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid email address.' }
    }

    const supabaseAdmin = createAdminClient()

    // Generate secure 4-digit OTP (e.g. 1000 to 9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiry

    // Delete any previous OTPs for this email to keep database clean
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('email', email)

    // Insert new OTP record
    const { error: insertErr } = await supabaseAdmin
      .from('password_reset_otps')
      .insert([{
        email,
        otp_code: otp,
        expires_at: expiresAt,
        verified: false
      }])

    if (insertErr) {
      console.error('Error inserting auth OTP:', insertErr)
      return { error: 'Failed to generate sign-in code. Please try again.' }
    }

    // Get customer name if already registered to personalize the greeting
    const { data: profile } = await supabaseAdmin
      .from('customer_profiles')
      .select('name')
      .ilike('email', email)
      .maybeSingle()

    const customerName = profile?.name?.trim() || 'Valued Customer'

    // Dispatch fast OTP email via direct SMTP (1-2 seconds delivery)
    const emailRes = await sendLoginOTPEmail(email, otp, customerName, 5)

    if (!emailRes.success) {
      console.warn('sendLoginOTPEmail warning:', emailRes.error)
    }

    return { success: true, email }
  } catch (err: any) {
    console.error('sendLoginOTP catch error:', err)
    return { error: err.message || 'An unexpected error occurred.' }
  }
}

// 2. Verify 4-Digit OTP & Check If Profile (Name & Phone) Is Complete
export async function verifyLoginOTP(formData: FormData) {
  try {
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const otp = (formData.get('otp') as string)?.trim()

    if (!email || !otp) {
      return { error: 'Email and 4-digit verification code are required.' }
    }

    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return { error: 'Please enter a valid 4-digit numeric code.' }
    }

    const supabaseAdmin = createAdminClient()
    const now = new Date().toISOString()

    // Find matching unverified, non-expired OTP record
    const { data: record, error } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !record) {
      return { error: 'Invalid or expired 4-digit code. Please request a new code.' }
    }

    // Delete used OTP record immediately after verification
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('email', email)

    // Check if customer profile exists and already has Name & Phone filled
    const { data: profile } = await supabaseAdmin
      .from('customer_profiles')
      .select('id, name, phone, email')
      .ilike('email', email)
      .maybeSingle()

    const hasName = Boolean(profile?.name && profile.name.trim().length > 0)
    const hasPhone = Boolean(profile?.phone && profile.phone.trim().length > 0)

    // If existing customer with both Name and Phone filled -> Direct Login!
    if (profile && hasName && hasPhone) {
      await createSession(email)
      return { 
        success: true, 
        requiresProfile: false, 
        email 
      }
    }

    // If new customer or name/phone missing -> Request Name & Phone
    return { 
      success: true, 
      requiresProfile: true, 
      email,
      existingName: profile?.name || '',
      existingPhone: profile?.phone || ''
    }
  } catch (err: any) {
    console.error('verifyLoginOTP error:', err)
    return { error: 'Verification failed. Please try again.' }
  }
}

// 3. Complete Profile (Name & Phone) For New Users -> Log In
export async function completeCustomerProfile(formData: FormData) {
  try {
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const name = (formData.get('name') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()

    if (!email || !email.includes('@')) {
      return { error: 'Valid email is required.' }
    }

    if (!name || name.length < 2) {
      return { error: 'Please enter your full name.' }
    }

    if (!phone || phone.length < 7) {
      return { error: 'Please enter a valid mobile number.' }
    }

    const supabaseAdmin = createAdminClient()

    // Check if profile exists
    const { data: existing } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin
        .from('customer_profiles')
        .update({
          name,
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('customer_profiles')
        .insert([{
          email,
          name,
          phone
        }])
    }

    // Create session cookie
    await createSession(email)

    return { success: true }
  } catch (err: any) {
    console.error('completeCustomerProfile error:', err)
    return { error: err.message || 'Failed to save profile. Please try again.' }
  }
}

// 4. Sign Out
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const { destroySession } = await import('@/lib/auth')
  await destroySession()
}

// 5. Get Customer Profile & Saved Addresses for Checkout Auto-Fill
export async function getCustomerDetailsByEmail(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const supabaseAdmin = createAdminClient()

    // 1. Fetch Profile
    const { data: profile } = await supabaseAdmin
      .from('customer_profiles')
      .select('id, name, phone, email')
      .ilike('email', cleanEmail)
      .maybeSingle()

    // 2. Fetch Addresses
    let addresses: any[] = []
    if (profile?.id) {
      const { data: addrList } = await supabaseAdmin
        .from('addresses')
        .select('*')
        .eq('user_id', profile.id)
        .order('is_default', { ascending: false })
      addresses = addrList || []
    }

    // Also check if any addresses match customer's phone or user_id
    if (addresses.length === 0 && profile?.phone) {
      const { data: phoneAddrs } = await supabaseAdmin
        .from('addresses')
        .select('*')
        .eq('phone', profile.phone)
        .order('is_default', { ascending: false })
      addresses = phoneAddrs || []
    }

    return {
      success: true,
      profile: profile || null,
      addresses
    }
  } catch (err: any) {
    console.error('getCustomerDetailsByEmail error:', err)
    return { success: false, error: err.message, addresses: [] }
  }
}


