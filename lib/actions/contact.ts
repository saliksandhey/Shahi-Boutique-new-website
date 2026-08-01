'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1)
})

export async function submitContactForm(formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message')
    }

    const validated = contactSchema.safeParse(data)
    if (!validated.success) {
      return { error: 'Invalid fields' }
    }

    const supabase = createAdminClient()
    
    // We append the email to the message because product_enquiries might not have an email column
    const fullMessage = `Email: ${validated.data.email}\n\n${validated.data.message}`
    
    const { error } = await supabase.from('product_enquiries').insert([{
      full_name: validated.data.name,
      phone_number: validated.data.phone || 'N/A',
      country: 'N/A',
      state: 'N/A',
      message: fullMessage,
      product_id: null // Leave null for general concierge
    }])

    if (error) {
      console.error('Error inserting concierge enquiry:', error)
      return { error: 'Failed to submit form' }
    }

    return { success: true }
  } catch (error) {
    console.error('Contact form error:', error)
    return { error: 'Something went wrong' }
  }
}
