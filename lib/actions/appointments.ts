'use server'

import { createClient, createAdminClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(data: {
  name: string
  phone: string
  email?: string
  city: string
  service: string
  appointment_date: string
  appointment_time: string
  requirements?: string
}) {
  const supabase = await createClient()
  
  // Generate booking ID
  const booking_id = `SHAHI-${Math.floor(100000 + Math.random() * 900000)}`

  const { error } = await supabase
    .from('appointments')
    .insert([{
      ...data,
      booking_id,
      status: 'PENDING'
    }])

  if (error) {
    console.error('Failed to create appointment:', error)
    return { success: false, error: 'Failed to create appointment' }
  }

  // Optional: revalidate admin page if necessary
  revalidatePath('/2010admin/appointments')
  
  return { success: true, booking_id }
}

export async function getAdminAppointments() {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch appointments:', error)
    return { success: false, data: [] }
  }

  return { success: true, data }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Failed to update appointment status:', error)
    return { success: false, error: 'Failed to update status' }
  }

  revalidatePath('/2010admin/appointments')
  return { success: true }
}
