export interface ListingCatalogResponse {
  items: ListingRecord[]
  filters: ListingCatalogFilters
  meta: ListingCatalogMeta
}

export interface ListingRecord {
  id: string
  title: string
  city: string
  region: string
  country: string
  address_line: string
  property_type: string
  guests_limit: number
  min_nights: number
  max_nights: number
  nightly_rate_cents: number
  bedrooms: number
  bathrooms: number
  area_sq_m: number
  tags: string[]
  amenities: string[]
  highlights: string[]
  thumbnail_url: string
  rating: number
  available_from: string
  state: string
  availability?: ListingAvailabilityRecord
}

export interface ListingCatalogFilters {
  city: string
  region: string
  country: string
  location: string
  tags: string[]
  amenities: string[]
  min_guests: number
  price_min_cents: number
  price_max_cents: number
  property_types: string[]
  check_in: string
  check_out: string
}

export interface ListingCatalogMeta {
  total: number
  count: number
  limit: number
  offset: number
  sort: string
  page: number
  total_pages: number
}

export interface ListingAvailabilityRecord {
  check_in: string
  check_out: string
  nights: number
  guests: number
  is_available: boolean
  reason?: string
}

export type ListingMood = 'calm' | 'energetic' | 'heritage'

export interface Listing {
  id: string
  title: string
  location: string
  price: string
  area: string
  availableFrom: string
  tags: string[]
  features: string[]
  mood: ListingMood
  thumbnail: string
  rating?: number
}

export interface ListingAddress {
  line1: string
  line2: string
  city: string
  region: string
  country: string
  lat: number
  lon: number
}

export interface AvailabilityWindow {
  from: string
  to: string
}

export interface ListingCalendarBlock {
  from: string
  to: string
  reason: string
}

export interface ListingCalendar {
  listing_id: string
  blocks: ListingCalendarBlock[]
}

export interface ListingOverview {
  id: string
  title: string
  description: string
  address: ListingAddress
  amenities: string[]
  guests_limit: number
  min_nights: number
  max_nights: number
  house_rules: string[]
  host: {
    id: string
  }
  state: string
  calendar: ListingCalendar
  availability_window: AvailabilityWindow
}

export interface HostListingCatalogResponse {
  items: HostListingSummary[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export interface HostListingSummary {
  id: string
  title: string
  status: string
  city: string
  region: string
  country: string
  nightly_rate_cents: number
  guests_limit: number
  bedrooms: number
  bathrooms: number
  floor: number
  floors_total: number
  renovation_score: number
  building_age_years: number
  area_sq_m: number
  available_from: string
  thumbnail_url: string
  photos?: string[]
  updated_at: string
  state: string
}

export interface HostListingDetailResponse {
  id: string
  title: string
  description: string
  property_type: string
  address: ListingAddress
  amenities: string[]
  guests_limit: number
  min_nights: number
  max_nights: number
  house_rules: string[]
  host: {
    id: string
  }
  state: string
  status: string
  tags: string[]
  highlights: string[]
  nightly_rate_cents: number
  bedrooms: number
  bathrooms: number
  floor: number
  floors_total: number
  renovation_score: number
  building_age_years: number
  area_sq_m: number
  thumbnail_url: string
  photos?: string[]
  cancellation_policy_id: string
  available_from: string
  created_at: string
  updated_at: string
}

export interface HostListingPayload {
  title: string
  description: string
  property_type: string
  address: ListingAddress
  amenities: string[]
  house_rules: string[]
  tags: string[]
  highlights: string[]
  thumbnail_url?: string
  cancellation_policy_id?: string
  guests_limit: number
  min_nights: number
  max_nights: number
  nightly_rate_cents: number
  bedrooms: number
  bathrooms: number
  floor: number
  floors_total: number
  renovation_score: number
  building_age_years: number
  area_sq_m: number
  available_from?: string
  photos: string[]
}

export interface HostListingPriceSuggestionResponse {
  listing_id: string
  recommended_price_cents: number
  current_price_cents: number
  price_level: 'below_market' | 'fair' | 'above_market'
  price_gap_percent: number
  message: string
  range: {
    check_in: string
    check_out: string
  }
}
