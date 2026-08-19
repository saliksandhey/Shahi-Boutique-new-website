'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'
import { createSession, destroySession } from '@/lib/auth'

// Define the transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contact.shahiboutique@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// Helper: generate 6 digit code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(formData: FormData) {
  const email = formData.get('email') as string
  if (!email || !email.includes('@')) return { error: 'Invalid email address.' }

  const supabase = createAdminClient()
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const { error: dbError } = await supabase.from('email_otps').insert({
    email,
    otp,
    expires_at: expiresAt.toISOString(),
    attempts: 0,
    used: false
  })

  if (dbError) {
    console.error("OTP DB Error:", dbError)
    return { error: 'Failed to generate OTP. Please try again.' }
  }

  try {
    if (!process.env.EMAIL_APP_PASSWORD) {
      console.warn("EMAIL_APP_PASSWORD not set. Cannot send OTP.")
      return { error: 'Email configuration missing on server.' }
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; text-align: center;">
        <h1 style="font-size: 24px; color: #111827; margin-bottom: 16px;">Shahi Boutique Verification</h1>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">Your secure verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #000; background: #fff; padding: 16px 24px; border: 1px solid #d1d5db; border-radius: 8px; display: inline-block;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
      </div>
    `

    const options = {
      from: '"Shahi Boutique" <contact.shahiboutique@gmail.com>',
      to: email,
      subject: 'Your Verification Code - Shahi Boutique',
      html: html,
    }

    await transporter.sendMail(options)
    return { success: true }
  } catch (err: any) {
    console.error("Email Sending Exception:", err)
    return { error: 'Failed to send email.' }
  }
}

export async function verifyOTP(formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('token') as string

  if (!email || !code) return { error: 'Email and code are required.' }

  const supabase = createAdminClient()

  const { data: record, error } = await supabase
    .from('email_otps')
    .select('*')
    .eq('email', email)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !record) {
    return { error: 'Invalid or expired code. Please request a new one.' }
  }

  if (record.attempts >= 5) {
    return { error: 'Too many failed attempts. Please request a new code.' }
  }

  if (record.otp !== code) {
    await supabase.from('email_otps').update({ attempts: record.attempts + 1 }).eq('id', record.id)
    return { error: 'Incorrect code. Please try again.' }
  }

  // Success
  await supabase.from('email_otps').update({ used: true }).eq('id', record.id)

  const { data: profile } = await supabase.from('customer_profiles').select('id').eq('email', email).single()
  if (!profile) {
    await supabase.from('customer_profiles').insert({ email })
  }

  await createSession(email)
  return { success: true }
}

export async function signout() {
  const supabase = createAdminClient() // Or better, we should use createClient to clear the user's cookies.
  
  // Actually, we must use createClient from @supabase/ssr to clear cookies properly
  const { createClient } = await import('@/lib/supabase/server')
  const client = await createClient()
  await client.auth.signOut()
  
  await destroySession() // Keep old fallback cleanup
  redirect('/login')
}
