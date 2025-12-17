import { apiGet, apiPost } from './api'
import type { Review, ReviewCollection } from '../types/review'

export async function submitReview(bookingId: string, rating: number, text?: string) {
  return apiPost<Review>(`/bookings/${bookingId}/review`, { rating, text })
}

export async function getListingReviews(listingId: string, options?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams()
  if (options?.limit) {
    params.set('limit', String(options.limit))
  }
  if (options?.offset) {
    params.set('offset', String(options.offset))
  }
  const query = params.toString()
  const path = query ? `/listings/${listingId}/reviews?${query}` : `/listings/${listingId}/reviews`
  return apiGet<ReviewCollection>(path)
}
