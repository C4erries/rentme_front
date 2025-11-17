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
}
