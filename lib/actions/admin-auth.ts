'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

export async function adminLogin(formData: FormData) {
  const pin = formData.get('pin') as string

  if (!pin || pin.length !== 4) {
    return { error: 'Invalid PIN format.' }
  }

  const supabase = await createAdminClient()
  
  // Get the PIN from settings
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'admin_pin')
    .single()

  // Default PIN is '2010' if none is set in the DB
  const validPin = data?.value || '2010'

  if (pin !== validPin) {
    return { error: 'Incorrect PIN.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', 'supabase_admin_authenticated', {
    httpOnly: true,
    secure: false, // Ensure it works on HTTP!
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  revalidatePath('/2010admin', 'layout')
  redirect('/2010admin')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  redirect('/2010admin')
}
