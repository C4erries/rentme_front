export interface ListingCatalogResponse {
  items: ListingRecord[]
  filters: ListingCatalogFilters
  meta: ListingCatalogMeta
}

export interface ListingRecord {
  id: string
  title: string
  city: string
  country: string
  address_line: string
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
}

export interface ListingCatalogFilters {
  city: string
  country: string
  tags: string[]
  amenities: string[]
  min_guests: number
  price_min_cents: number
  price_max_cents: number
}

export interface ListingCatalogMeta {
  total: number
  count: number
  limit: number
  offset: number
  sort: string
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
