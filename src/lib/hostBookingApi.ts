import { apiGet, apiPost } from './api'
import type { HostBookingCollection } from '../types/booking'

export function getHostBookings(status?: string) {
  const params = new URLSearchParams()
  if (status) {
    params.set('status', status)
  }
  const query = params.toString()
  const path = query ? `/host/bookings?${query}` : '/host/bookings'
  return apiGet<HostBookingCollection>(path)
}

export function confirmHostBooking(bookingId: string) {
  return apiPost<{ booking_id: string; status: string }>(`/host/bookings/${bookingId}/confirm`, {})
}

export function declineHostBooking(bookingId: string, reason?: string) {
  const payload = reason ? { reason } : {}
  return apiPost<{ booking_id: string; status: string }>(`/host/bookings/${bookingId}/decline`, payload)
}
