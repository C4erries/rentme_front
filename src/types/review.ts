export interface Review {
  id: string
  booking_id: string
  listing_id: string
  author_id: string
  rating: number
  text?: string
  created_at: string
}

export interface ReviewCollection {
  items: Review[]
  total: number
}
