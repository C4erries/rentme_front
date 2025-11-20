import { apiGet } from './api'
import type { GuestBookingCollection } from '../types/booking'

export async function getMyBookings() {
  return apiGet<GuestBookingCollection>('/me/bookings')
}
