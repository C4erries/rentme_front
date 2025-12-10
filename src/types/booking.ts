export interface MoneyDTO {
  amount: number
  currency: string
}

export interface BookingListingSnapshot {
  id: string
  title: string
  address_line1: string
  city: string
  region: string
  country: string
  thumbnail_url: string
}

export interface GuestBookingSummary {
  id: string
  listing: BookingListingSnapshot
  check_in: string
  check_out: string
  guests: number
  status: string
  total: MoneyDTO
  created_at: string
}

export interface GuestBookingCollection {
  items: GuestBookingSummary[]
}
