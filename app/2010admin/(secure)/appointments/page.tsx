import { getAdminAppointments } from '@/lib/actions/appointments'
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusActions } from './StatusActions'
import { getStoreSettings } from '@/lib/actions/settings'
import { TimeSlotsManager } from './TimeSlotsManager'

export default async function AdminAppointmentsPage() {
  const { data: appointments } = await getAdminAppointments()
  const settings = await getStoreSettings()
  
  const defaultSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  const timeSlots = settings.appointment_time_slots 
    ? settings.appointment_time_slots.split(',').filter(Boolean)
    : defaultSlots

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Appointments</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage your boutique consultations.</p>
        </div>
        <TimeSlotsManager initialSlots={timeSlots} />
      </div>

      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Booking ID</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Client Info</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Service & Location</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Date & Time</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments?.map((apt) => (
              <TableRow key={apt.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="font-black text-[#FF7A00] uppercase tracking-widest text-xs">
                  {apt.booking_id}
                </TableCell>
                <TableCell>
                  <div className="font-black text-gray-900 uppercase tracking-widest text-xs">{apt.name}</div>
                  <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{apt.phone}</div>
                  {apt.email && <div className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">{apt.email}</div>}
                </TableCell>
                <TableCell>
                  <div className="font-black text-gray-900 uppercase tracking-widest text-xs">{apt.service}</div>
                  <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {apt.city}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(apt.appointment_date).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {apt.appointment_time}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {apt.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <StatusActions appointmentId={apt.id} currentStatus={apt.status} />
                </TableCell>
              </TableRow>
            ))}
            {!appointments?.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {appointments?.map((apt) => (
          <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[#FF7A00] font-black text-[10px] uppercase tracking-widest mb-1">{apt.booking_id}</div>
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">{apt.name}</h3>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">{apt.phone}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                {apt.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-y border-gray-50 py-3">
              <div>Service: <span className="text-gray-900 block mt-1">{apt.service}</span></div>
              <div>City: <span className="text-gray-900 block mt-1">{apt.city}</span></div>
              <div className="flex items-center gap-1 mt-2"><Calendar className="w-3 h-3" /> {new Date(apt.appointment_date).toLocaleDateString()}</div>
              <div className="flex items-center gap-1 mt-2"><Clock className="w-3 h-3" /> {apt.appointment_time}</div>
            </div>

            <div className="flex justify-end pt-2">
              <StatusActions appointmentId={apt.id} currentStatus={apt.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
