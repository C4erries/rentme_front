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
  months?: number
  price_unit?: 'night' | 'month' | string
  status: string
  total: MoneyDTO
  created_at: string
  review_submitted?: boolean
  can_review?: boolean
}

export interface GuestBookingCollection {
  items: GuestBookingSummary[]
}

export interface HostBookingSummary {
  id: string
  listing: BookingListingSnapshot
  guest_id: string
  check_in: string
  check_out: string
  guests: number
  months?: number
  price_unit?: 'night' | 'month' | string
  status: string
  total: MoneyDTO
  created_at: string
}

export interface HostBookingCollection {
  items: HostBookingSummary[]
}
