'use client'

import { useState } from 'react'
import { Check, X, MoreHorizontal } from 'lucide-react'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function StatusActions({ appointmentId, currentStatus }: { appointmentId: string, currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (status: string) => {
    setIsUpdating(true)
    await updateAppointmentStatus(appointmentId, status)
    setIsUpdating(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00] h-8 w-8 p-0 rounded-full" 
        disabled={isUpdating}
      >
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-2 border-gray-100 shadow-xl">
        <DropdownMenuItem 
          onClick={() => handleUpdate('CONFIRMED')}
          disabled={currentStatus === 'CONFIRMED' || isUpdating}
          className="text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-50 focus:bg-gray-50 rounded-lg p-3"
        >
          Mark Confirmed
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleUpdate('COMPLETED')}
          disabled={currentStatus === 'COMPLETED' || isUpdating}
          className="text-xs font-bold uppercase tracking-widest cursor-pointer text-green-600 hover:bg-green-50 focus:bg-green-50 rounded-lg p-3"
        >
          <Check className="mr-2 h-4 w-4" /> Mark Completed
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleUpdate('CANCELLED')}
          disabled={currentStatus === 'CANCELLED' || isUpdating}
          className="text-xs font-bold uppercase tracking-widest cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg p-3"
        >
          <X className="mr-2 h-4 w-4" /> Cancel Booking
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
