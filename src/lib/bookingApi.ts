import { apiPost } from './api'

export interface CreateBookingPayload {
  listing_id: string
  check_in: string
  check_out: string
  guests: number
}

export function createBooking(payload: CreateBookingPayload) {
  return apiPost<{ booking_id: string }>('/bookings', payload)
}
