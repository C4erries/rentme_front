import { useEffect, useMemo, useState } from 'react'
import { apiGet, hasApiBaseUrl } from '../lib/api'
import type { Listing, ListingCatalogResponse, ListingMood, ListingRecord } from '../types/listing'

const FEATURED_LIMIT = 6

export interface FeaturedListingFilters {
  city?: string
  minGuests?: number
}

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'

export function useFeaturedListings(filters: FeaturedListingFilters = {}) {
  const hasBaseUrl = hasApiBaseUrl()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState<boolean>(hasBaseUrl)
  const [sourceHint, setSourceHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const queryPath = useMemo(() => {
    if (!hasBaseUrl) {
      return null
    }
    const params = new URLSearchParams({
      limit: String(FEATURED_LIMIT),
      sort: 'rating_desc',
    })
    if (filters.city) {
      params.set('city', filters.city)
    }
    if (filters.minGuests && filters.minGuests > 0) {
      params.set('min_guests', String(filters.minGuests))
    }
    return `/listings?${params.toString()}`
  }, [filters.city, filters.minGuests, hasBaseUrl])

  useEffect(() => {
    if (!queryPath) {
      setLoading(false)
      setListings([])
      setSourceHint(null)
      setError('API не настроен. Укажите VITE_API_BASE_URL в .env.')
      return
    }

    const path = queryPath
    const controller = new AbortController()

    async function loadFeatured() {
      try {
        setLoading(true)
        setError(null)
        const { data, response } = await apiGet<ListingCatalogResponse>(path, {
          signal: controller.signal,
        })
        if (!data.items?.length) {
          setListings([])
          setError('По заданным условиям ничего не нашли — попробуйте изменить фильтры.')
          setSourceHint(null)
          return
        }

        setListings(data.items.map(mapListing))
        setError(null)

        const lastModified = response.headers.get('last-modified')
        if (lastModified) {
          const formatted = new Date(lastModified).toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })
          setSourceHint(`Обновлено ${formatted}`)
        } else if (data.meta?.total) {
          setSourceHint(`В каталоге ${data.meta.total} предложений`)
        } else {
          setSourceHint('Коллекция доступных предложений обновляется ежедневно')
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        console.warn('Failed to load featured listings', err)
        setListings([])
        setError('Не удалось загрузить подборку. Попробуйте обновить страницу позже.')
        setSourceHint(null)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadFeatured()
    return () => controller.abort()
  }, [queryPath, reloadToken])

  const refresh = () => setReloadToken((token) => token + 1)

  return { listings, loading, sourceHint, error, refresh }
}

export function mapListing(card: ListingRecord): Listing {
  const locationParts = [card.city, card.region, card.address_line].filter(Boolean)
  const areaParts: string[] = []
  if (card.area_sq_m) {
    areaParts.push(`${Math.round(card.area_sq_m)} м²`)
  }
  if (card.bedrooms > 0) {
    areaParts.push(`${card.bedrooms} ${pluralize(card.bedrooms, ['спальня', 'спальни', 'спален'])}`)
  }
  if (card.bathrooms > 0) {
    areaParts.push(`${card.bathrooms} ${pluralize(card.bathrooms, ['санузел', 'санузла', 'санузлов'])}`)
  }

  const highlights = card.highlights?.length ? card.highlights : card.amenities?.slice(0, 3) ?? []
  const availableFrom = formatAvailableDate(card.available_from)
  const unit = normalizePriceUnit(card.price_unit, card.rental_term)

  return {
    id: card.id,
    title: card.title,
    location: locationParts.join(' · ') || card.city || 'Локация уточняется',
    price: formatRate(card.rate_cents ?? card.nightly_rate_cents, unit),
    area: areaParts.join(' · ') || 'Площадь уточняется',
    availableFrom,
    tags: (card.tags ?? []).slice(0, 3),
    features: dedupeStrings(highlights, 3),
    mood: resolveMood(card),
    thumbnail: card.thumbnail_url || FALLBACK_IMAGE,
    rating: card.rating,
  }
}

function normalizePriceUnit(unit?: string, rentalTerm?: string) {
  if (unit === 'night' || unit === 'month') {
    return unit
  }
  return rentalTerm === 'long_term' ? 'month' : 'night'
}

function formatRate(cents: number, unit: string) {
  if (!cents) {
    return 'Цена по запросу'
  }
  const base = priceFormatter.format(Math.round(cents / 100))
  return unit === 'month' ? `${base} / месяц` : `${base} / ночь`
}

function formatAvailableDate(value: string | undefined) {
  if (!value) {
    return 'Готово к заселению'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Готово к заселению'
  }
  return `с ${dateFormatter.format(date)}`
}

function resolveMood(card: ListingRecord): ListingMood {
  const context = [card.city, card.region, card.address_line, ...(card.tags ?? []), ...(card.highlights ?? [])]
    .join(' ')
    .toLowerCase()
  if (context.match(/истор|камин|сад/)) {
    return 'heritage'
  }
  if (context.match(/лофт|центр|панорам/)) {
    return 'energetic'
  }
  return 'calm'
}

function pluralize(value: number, forms: [string, string, string]) {
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) {
    return forms[0]
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1]
  }
  return forms[2]
}

function dedupeStrings(values: string[] | null | undefined, limit: number) {
  if (!values?.length) {
    return []
  }
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const normalized = value.trim()
    if (!normalized || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    result.push(normalized)
    if (result.length === limit) {
      break
    }
  }
  return result
}
