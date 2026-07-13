import type { Metadata } from 'next'
import { AppointmentForm } from '@/components/storefront/AppointmentForm'
import { getStoreSettings } from '@/lib/actions/settings'

export const metadata: Metadata = {
  title: 'Book Appointment | SHAHI',
  description: 'Schedule an exclusive consultation with our master designers.',
}

export default async function BookAppointmentPage() {
  const settings = await getStoreSettings()
  
  const defaultSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  const timeSlots = settings.appointment_time_slots 
    ? settings.appointment_time_slots.split(',').filter(Boolean)
    : defaultSlots

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* The Premium Form */}
        <AppointmentForm timeSlots={timeSlots} />
        
      </div>
    </div>
  )
}
