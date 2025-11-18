import { useEffect, useMemo, useState } from 'react'
import { useFeaturedListings } from '../hooks/useFeaturedListings'
import type { Listing } from '../types/listing'
import { ListingPreview } from './ListingPreview'

const moodStyles = {
  calm: 'from-dusty-mauve-50 to-khaki-beige-50',
  energetic: 'from-cream-50 to-dry-sage-50',
  heritage: 'from-khaki-beige-100 to-dusty-mauve-50',
} as const

const cityOptions = [
  { label: 'Все города', value: '' },
  { label: 'Москва', value: 'Moscow' },
  { label: 'Санкт-Петербург', value: 'Saint Petersburg' },
  { label: 'Прага', value: 'Prague' },
]

const guestOptions = [
  { label: 'Любое число гостей', value: 0 },
  { label: '2+ гостя', value: 2 },
  { label: '4+ гостя', value: 4 },
  { label: '6+ гостей', value: 6 },
]

function ListingCard({ listing, onPreview }: { listing: Listing; onPreview: () => void }) {
  return (
    <article className="grid gap-4 rounded-3xl border border-dusty-mauve-100 bg-gradient-to-b p-4 shadow-sm sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dusty-mauve-500">
          <span className="rounded-full bg-white/70 px-3 py-1 text-dusty-mauve-600">{listing.location}</span>
          {listing.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/50 px-3 py-1 text-dusty-mauve-500">
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-semibold text-dusty-mauve-900">{listing.title}</h3>
            {typeof listing.rating === 'number' && listing.rating > 0 && (
              <span className="rounded-full bg-dry-sage-100 px-2 py-0.5 text-xs font-semibold text-dry-sage-700">
                {listing.rating.toFixed(1)} ★
              </span>
            )}
          </div>
          <p className="text-sm text-dusty-mauve-500">{listing.area}</p>
        </div>

        <dl className="flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-dusty-mauve-500">Стоимость</dt>
            <dd className="text-lg font-semibold text-dusty-mauve-900">{listing.price}</dd>
          </div>
          <div>
            <dt className="text-dusty-mauve-500">Статус</dt>
            <dd className="font-semibold text-dusty-mauve-900">{listing.availableFrom}</dd>
          </div>
        </dl>

        <ul className="space-y-2 text-sm text-dusty-mauve-600">
          {listing.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dry-sage-500" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-dusty-mauve-800 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
          >
            Смотреть детали
          </button>
          <button
            type="button"
            className="rounded-full border border-transparent px-4 py-2 text-dry-sage-700 underline underline-offset-4"
          >
            Скачать досье дома
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="h-52 w-full object-cover sm:h-full"
            loading="lazy"
          />
        </div>
        <p className="text-xs uppercase text-dusty-mauve-500">
          Код подбора · <span className="font-mono">{listing.id}</span>
        </p>
      </div>
    </article>
  )
}

export function FeaturedListings() {
  const [cityFilter, setCityFilter] = useState<string>('')
  const [guestsFilter, setGuestsFilter] = useState<number>(0)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      city: cityFilter || undefined,
      minGuests: guestsFilter || undefined,
    }),
    [cityFilter, guestsFilter],
  )
  const { listings, loading, sourceHint, error, refresh } = useFeaturedListings(filters)
  const hasFilters = Boolean(cityFilter || guestsFilter)
  const selectedListing = useMemo(
    () => listings.find((item) => item.id === selectedListingId) ?? null,
    [listings, selectedListingId],
  )

  useEffect(() => {
    if (!selectedListingId) {
      return
    }
    if (!listings.some((item) => item.id === selectedListingId)) {
      setSelectedListingId(null)
    }
  }, [listings, selectedListingId])

  const resultsHint = loading
    ? 'Загружаем витрину...'
    : `Нашли ${listings.length} ${pluralizeListings(listings.length)}`

  function resetFilters() {
    setCityFilter('')
    setGuestsFilter(0)
  }

  return (
    <section className="container space-y-6 py-8" id="featured">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-dry-sage-600">витрина недели</p>
          <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
            Квартиры, готовые принять вас в ближайшие две недели
          </h2>
        </div>
        {sourceHint && <p className="text-xs text-dusty-mauve-500">{sourceHint}</p>}
      </div>

      <div className="glass-panel space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase text-dry-sage-600">
          <span>фильтры каталога</span>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-transparent px-3 py-1 text-dusty-mauve-600 underline underline-offset-4 hover:text-dry-sage-700"
            >
              сбросить
            </button>
          )}
          <span className="text-dusty-mauve-400">·</span>
          <span className="text-dusty-mauve-500">{resultsHint}</span>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {cityOptions.map((option) => {
              const isActive = cityFilter === option.value
              return (
                <button
                  type="button"
                  key={option.label}
                  onClick={() => setCityFilter(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? 'border-dry-sage-500 bg-dry-sage-100 text-dry-sage-800'
                      : 'border-dusty-mauve-100 bg-white/70 text-dusty-mauve-700 hover:border-dry-sage-200'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {guestOptions.map((option) => {
              const isActive = guestsFilter === option.value
              return (
                <button
                  type="button"
                  key={option.label}
                  onClick={() => setGuestsFilter(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? 'border-dry-sage-500 bg-dry-sage-100 text-dry-sage-800'
                      : 'border-dusty-mauve-100 bg-white/70 text-dusty-mauve-700 hover:border-dry-sage-200'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-cream-200 bg-cream-50/70 p-4 text-sm text-dusty-mauve-700">
          <div>{error}</div>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-full border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold uppercase text-dusty-mauve-600 hover:border-dry-sage-400 hover:text-dry-sage-700"
          >
            попробовать снова
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-64 animate-pulse rounded-3xl border border-dusty-mauve-100 bg-dusty-mauve-100/40"
              />
            ))
          : listings.length > 0
            ? listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-gradient-to-br ${moodStyles[listing.mood]} rounded-3xl`}
                >
                  <ListingCard listing={listing} onPreview={() => setSelectedListingId(listing.id)} />
                </div>
              ))
            : (
                <div className="rounded-3xl border border-dusty-mauve-100 bg-white/70 p-6 text-sm text-dusty-mauve-600">
                  В каталоге нет активных квартир по выбранным фильтрам. Попробуйте другой город или диапазон гостей.
                </div>
              )}
      </div>

      <ListingPreview
        listingId={selectedListingId}
        summary={selectedListing}
        onClose={() => setSelectedListingId(null)}
      />
    </section>
  )
}

function pluralizeListings(count: number) {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10
  if (mod100 > 10 && mod100 < 20) {
    return 'квартир'
  }
  if (mod10 === 1) {
    return 'квартира'
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'квартиры'
  }
  return 'квартир'
}
