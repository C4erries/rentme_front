import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ListingPreview } from '../components/ListingPreview'
import { StateCard } from '../components/StateCard'
import { useCatalogListings } from '../hooks/useCatalogListings'
import { mapListing } from '../hooks/useFeaturedListings'
import { withViewTransition } from '../lib/viewTransitions'
import { createListingConversation } from '../lib/chatApi'
import { ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Listing, ListingRecord } from '../types/listing'

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })

const PROPERTY_TYPE_OPTIONS = [
  { label: 'Все типы', value: '' },
  { label: 'Квартира', value: 'apartment' },
  { label: 'Лофт', value: 'loft' },
  { label: 'Таунхаус', value: 'townhouse' },
  { label: 'Дом/дача', value: 'cabin' },
]

const SORT_OPTIONS = [
  { label: 'Цена: дешевле', value: 'price_asc' },
  { label: 'Цена: дороже', value: 'price_desc' },
  { label: 'Рейтинг', value: 'rating_desc' },
  { label: 'Сначала новые', value: 'newest' },
]

const RENTAL_TERM_OPTIONS = [
  { label: 'Любой срок', value: '' },
  { label: 'Посуточно', value: 'short_term' },
  { label: 'Долгосрочно', value: 'long_term' },
]

interface CatalogPageProps {
  route: { pathname: string; search: string }
  onNavigate: (path: string, options?: { replace?: boolean }) => void
}

interface CatalogFormState {
  location: string
  checkIn: string
  checkOut: string
  guests: string
  priceMin: string
  priceMax: string
  propertyType: string
  rentalTerm: string
  sort: string
  page: number
}

const DEFAULT_STATE: CatalogFormState = {
  location: '',
  checkIn: '',
  checkOut: '',
  guests: '',
  priceMin: '',
  priceMax: '',
  propertyType: '',
  rentalTerm: '',
  sort: 'price_asc',
  page: 1,
}

function parseSearch(search: string): CatalogFormState {
  const params = new URLSearchParams(search?.startsWith('?') ? search.slice(1) : search ?? '')
  return {
    location: params.get('location') ?? '',
    checkIn: params.get('check_in') ?? '',
    checkOut: params.get('check_out') ?? '',
    guests: params.get('guests') ?? params.get('min_guests') ?? '',
    priceMin: params.get('price_min_rub') ?? params.get('price_min') ?? '',
    priceMax: params.get('price_max_rub') ?? params.get('price_max') ?? '',
    propertyType: params.get('type') ?? '',
    rentalTerm: params.get('rental_term') ?? '',
    sort: params.get('sort') ?? DEFAULT_STATE.sort,
    page: Number(params.get('page') ?? '1') || 1,
  }
}

function buildQuery(state: CatalogFormState) {
  const params = new URLSearchParams()
  params.set('limit', '20')
  params.set('page', String(state.page || 1))
  if (state.location) {
    params.set('location', state.location)
  }
  if (state.checkIn) {
    params.set('check_in', state.checkIn)
  }
  if (state.checkOut) {
    params.set('check_out', state.checkOut)
  }
  if (state.guests) {
    params.set('guests', state.guests)
  }
  if (state.priceMin) {
    params.set('price_min_rub', state.priceMin)
  }
  if (state.priceMax) {
    params.set('price_max_rub', state.priceMax)
  }
  if (state.propertyType) {
    params.set('type', state.propertyType)
  }
  if (state.rentalTerm) {
    params.set('rental_term', state.rentalTerm)
  }
  if (state.sort) {
    params.set('sort', state.sort)
  }
  return params.toString()
}

function createListingSummary(record: ListingRecord) {
  const summary = mapListing(record)
  const availability = formatAvailability(record)
  const priceUnit = normalizePriceUnit(record.price_unit, record.rental_term)
  const rate = priceFormatter.format(Math.round(record.rate_rub))
  const rateLabel = priceUnit === 'month' ? `${rate} / месяц` : `${rate} / ночь`
  return { summary, availability, rateLabel, priceUnit }
}

function formatAvailability(record: ListingRecord) {
  const availability = record.availability
  if (!availability?.check_in || !availability?.check_out) {
    return { text: 'Уточните даты у хоста', isAvailable: true }
  }
  const text = `${dateFormatter.format(new Date(availability.check_in))} — ${dateFormatter.format(
    new Date(availability.check_out),
  )}`
  if (availability.is_available) {
    return { text: `Свободно ${text}`, isAvailable: true }
  }
  return { text: `Недоступно ${text}`, isAvailable: false }
}

function normalizePriceUnit(unit?: string, rentalTerm?: string) {
  if (unit === 'month' || unit === 'night') {
    return unit
  }
  return rentalTerm === 'long_term' ? 'month' : 'night'
}

function priceUnitLabel(unit: string) {
  return unit === 'month' ? 'Цена за месяц' : 'Цена за ночь'
}

export function CatalogPage({ route, onNavigate }: CatalogPageProps) {
  const { user } = useAuth()
  const [formState, setFormState] = useState<CatalogFormState>(() => parseSearch(route.search))
  const { data, loading, error, refresh } = useCatalogListings(route.search)
  const listings = data?.items ?? []
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const listingFromQuery = useMemo(() => {
    const params = new URLSearchParams(route.search?.startsWith('?') ? route.search.slice(1) : route.search ?? '')
    const value = params.get('listing_id')?.trim()
    return value || null
  }, [route.search])

  useEffect(() => {
    setFormState(parseSearch(route.search))
  }, [route.search])

  useEffect(() => {
    if (listingFromQuery && listingFromQuery !== selectedListingId) {
      setSelectedListingId(listingFromQuery)
    }
  }, [listingFromQuery, selectedListingId])

  useEffect(() => {
    if (!selectedListingId) {
      return
    }
    if (!listings.some((item) => item.id === selectedListingId)) {
      setSelectedListingId(null)
    }
  }, [listings, selectedListingId])

  const cards = useMemo(
    () => listings.map((item) => ({ record: item, ...createListingSummary(item) })),
    [listings],
  )

  const selectedSummary: Listing | null = selectedListingId
    ? cards.find((card) => card.record.id === selectedListingId)?.summary ?? null
    : null

  const applyStateToUrl = (nextState: CatalogFormState, options?: { replace?: boolean }) => {
    const query = buildQuery(nextState)
    const path = query ? `/catalog?${query}` : '/catalog'
    onNavigate(path, options)
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextState = { ...formState, page: 1 }
    setFormState(nextState)
    applyStateToUrl(nextState)
  }

  const handleFilterChange = (updates: Partial<CatalogFormState>) => {
    const merged = { ...formState, ...updates, page: updates.page ?? 1 }
    setFormState(merged)
  }

  const applyImmediateFilter = (updates: Partial<CatalogFormState>) => {
    const merged = { ...formState, ...updates, page: 1 }
    setFormState(merged)
    applyStateToUrl(merged)
  }

  const handleApplyFilters = () => {
    applyStateToUrl(formState)
  }

  const changePage = (page: number) => {
    const safePage = page < 1 ? 1 : page
    const nextState = { ...formState, page: safePage }
    setFormState(nextState)
    applyStateToUrl(nextState)
  }

  const handleContactHost = async (listingId: string) => {
    if (!listingId) {
      return
    }
    if (user && listings.some((item) => item.id === listingId && item.host_id === user.id)) {
      return
    }
    setChatError(null)
    setChatLoadingId(listingId)
    try {
      const response = await createListingConversation(listingId)
      withViewTransition(() => onNavigate(`/me/chats/${response.data.id}`))
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        const redirectTarget = `/login?redirect=${encodeURIComponent(currentPathForRedirect(route))}`
        setChatError('Войдите, чтобы написать арендодателю')
        withViewTransition(() => onNavigate(redirectTarget))
      } else {
        setChatError((err as Error).message)
      }
    } finally {
      setChatLoadingId(null)
    }
  }

  const handleClosePreview = () => {
    setSelectedListingId(null)
    if (!listingFromQuery) {
      return
    }
    const params = new URLSearchParams(route.search?.startsWith('?') ? route.search.slice(1) : route.search ?? '')
    params.delete('listing_id')
    const query = params.toString()
    const target = query ? `${route.pathname}?${query}` : route.pathname || '/catalog'
    withViewTransition(() => onNavigate(target, { replace: true }))
  }

  const meta = data?.meta
  const totalLabel = meta ? `${meta.total} предложений` : 'Каталог'
  const initialGuests = formState.guests ? Number(formState.guests) || undefined : undefined
  const priceFilterLabel =
    formState.rentalTerm === 'long_term'
      ? 'Цена за месяц'
      : formState.rentalTerm === 'short_term'
        ? 'Цена за ночь'
        : 'Цена за ночь/месяц'

  const handleResetFilters = () => {
    const nextState = { ...DEFAULT_STATE, page: 1 }
    setFormState(nextState)
    applyStateToUrl(nextState)
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50 text-dusty-mauve-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-dusty-mauve-200/60 to-transparent" />
        <div className="pointer-events-none absolute -left-10 top-24 h-72 w-72 rounded-full bg-cream-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-44 h-72 w-72 rounded-full bg-khaki-beige-200/40 blur-3xl" />

        <Header onNavigate={onNavigate} />
        <main className="relative z-10 space-y-6 pb-16">
          {chatError && (
            <div className="container">
              <StateCard variant="error" title="Не удалось открыть чат" description={chatError} />
            </div>
          )}
          <section className="container space-y-4 pt-8">
            <div className="space-y-1">
              <p className="text-sm uppercase text-dry-sage-600">Каталог жилья</p>
              <div className="flex flex-col gap-2 text-dusty-mauve-900 sm:flex-row sm:items-baseline sm:justify-between">
                <h1 className="text-3xl font-semibold">Жильё, готовое принять гостей</h1>
                <p className="text-sm text-dusty-mauve-500">{totalLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {RENTAL_TERM_OPTIONS.map((option) => {
                const isActive = formState.rentalTerm === option.value
                return (
                  <button
                    key={option.value || 'all-terms'}
                    type="button"
                    onClick={() => applyImmediateFilter({ rentalTerm: option.value })}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'border-dry-sage-500 bg-dry-sage-100 text-dusty-mauve-900'
                        : 'border-dusty-mauve-200 bg-white/70 text-dusty-mauve-700 hover:border-dry-sage-400'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="glass-panel grid gap-3 rounded-3xl p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase text-dry-sage-600">Локация</span>
                <input
                  type="text"
                  value={formState.location}
                  onChange={(event) => handleFilterChange({ location: event.target.value })}
                  placeholder="город, район, метро"
                  className="rounded-2xl border border-dusty-mauve-100 bg-white/80 px-3 py-2 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase text-dry-sage-600">Заезд</span>
                <input
                  type="date"
                  value={formState.checkIn}
                  onChange={(event) => handleFilterChange({ checkIn: event.target.value })}
                  className="rounded-2xl border border-dusty-mauve-100 bg-white/80 px-3 py-2 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase text-dry-sage-600">Выезд</span>
                <input
                  type="date"
                  value={formState.checkOut}
                  onChange={(event) => handleFilterChange({ checkOut: event.target.value })}
                  className="rounded-2xl border border-dusty-mauve-100 bg-white/80 px-3 py-2 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase text-dry-sage-600">Гости</span>
                <input
                  type="number"
                  min={1}
                  value={formState.guests}
                  onChange={(event) => handleFilterChange({ guests: event.target.value })}
                  placeholder="2"
                  className="rounded-2xl border border-dusty-mauve-100 bg-white/80 px-3 py-2 text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                />
              </label>
              <button
                type="submit"
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-dusty-mauve-900 px-4 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800 sm:mt-auto"
              >
                Применить
              </button>
            </form>

            <div className="glass-panel space-y-4 rounded-3xl p-4">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase text-dry-sage-600">
                <span>Базовые фильтры</span>
                <span className="text-dusty-mauve-400">·</span>
                <span className="text-dusty-mauve-500">{data?.filters.location || 'по всей платформе'}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase text-dry-sage-600">{priceFilterLabel}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="number"
                      min={0}
                      placeholder="от"
                      value={formState.priceMin}
                      onChange={(event) => handleFilterChange({ priceMin: event.target.value })}
                      className="flex-1 rounded-2xl border border-dusty-mauve-100 bg-white/80 px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="до"
                      value={formState.priceMax}
                      onChange={(event) => handleFilterChange({ priceMax: event.target.value })}
                      className="flex-1 rounded-2xl border border-dusty-mauve-100 bg-white/80 px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase text-dry-sage-600">Тип жилья</p>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPE_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value || 'all'}
                        onClick={() => applyImmediateFilter({ propertyType: option.value })}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          formState.propertyType === option.value
                            ? 'border-dry-sage-500 bg-dry-sage-100 text-dry-sage-800'
                            : 'border-dusty-mauve-100 bg-white/80 text-dusty-mauve-700 hover:border-dry-sage-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {SORT_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => applyImmediateFilter({ sort: option.value })}
                    className={`rounded-full border px-4 py-1.5 transition ${
                      formState.sort === option.value
                        ? 'border-dry-sage-500 bg-dry-sage-100 text-dry-sage-800'
                        : 'border-dusty-mauve-100 bg-white/80 text-dusty-mauve-700 hover:border-dry-sage-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <span className="text-xs uppercase text-dry-sage-600">Сортировка</span>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="ml-auto rounded-full border border-dusty-mauve-200 px-4 py-1.5 text-xs font-semibold uppercase text-dusty-mauve-600 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
                >
                  Обновить выдачу
                </button>
              </div>
            </div>
          </section>

          <section className="container space-y-4">
            {error && (
              <StateCard
                variant="error"
                title="Каталог временно недоступен"
                description={error}
                actionLabel="Попробовать снова"
                onAction={refresh}
              />
            )}

            <div
              className={`grid gap-4 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}
              style={{ minHeight: '24rem' }}
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-48 animate-pulse rounded-3xl border border-dusty-mauve-100 bg-white/70"
                  />
                ))
              ) : cards.length > 0 ? (
                cards.map((card) => {
                  const isOwnListing = Boolean(user?.id && card.record.host_id === user.id)
                  const isChatLoading = chatLoadingId === card.record.id
                  const contactButtonDisabled = isOwnListing || isChatLoading
                  const contactButtonLabel = isOwnListing
                    ? 'Ваше объявление'
                    : isChatLoading
                      ? 'Открываем чат...'
                      : 'Написать арендодателю'
                  return (
                    <article
                      key={card.record.id}
                      className="grid gap-4 rounded-3xl border border-dusty-mauve-100 bg-white/90 p-5 shadow-sm sm:grid-cols-[1.2fr_0.8fr]"
                    >
                      <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-dry-sage-600">
                        <span className="rounded-full bg-dry-sage-100 px-3 py-1 text-dry-sage-800">
                          {card.record.property_type || 'жильё'}
                        </span>
                        {user?.id && card.record.host_id === user.id && (
                          <span className="rounded-full bg-dusty-mauve-900 px-3 py-1 text-dusty-mauve-50">
                            Ваше объявление
                          </span>
                        )}
                        {card.record.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-white/70 px-3 py-1 text-dusty-mauve-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-dusty-mauve-900">{card.summary.title}</h2>
                        <p className="text-sm text-dusty-mauve-500">{card.summary.location}</p>
                      </div>
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                          <p className="text-dusty-mauve-500">{priceUnitLabel(card.priceUnit)}</p>
                          <p className="text-lg font-semibold text-dusty-mauve-900">{card.rateLabel}</p>
                        </div>
                        <div>
                          <p className="text-dusty-mauve-500">Доступность</p>
                          <p
                            className={`text-sm font-semibold ${
                              card.availability.isAvailable ? 'text-dry-sage-700' : 'text-dusty-mauve-500'
                            }`}
                          >
                            {card.availability.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-dusty-mauve-600">
                        {card.summary.features.map((feature) => (
                          <span key={feature} className="rounded-full border border-dusty-mauve-100 px-3 py-1">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm font-semibold">
                        <button
                          type="button"
                          onClick={() => setSelectedListingId(card.record.id)}
                          className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-dusty-mauve-800 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
                        >
                          Смотреть детали
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContactHost(card.record.id)}
                          disabled={contactButtonDisabled}
                          className="inline-flex items-center rounded-full border border-dry-sage-400 px-4 py-2 text-dry-sage-700 transition hover:bg-dry-sage-50 disabled:opacity-60"
                        >
                          {contactButtonLabel}
                        </button>
                        <a
                          href={`mailto:care@rentme.app?subject=Rentme%20-%20Listing%20${card.record.id}`}
                          className="inline-flex items-center rounded-full border border-transparent px-4 py-2 text-dry-sage-700 underline underline-offset-4"
                        >
                          Запросить просмотр
                        </a>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-2xl">
                        <img
                          src={card.summary.thumbnail}
                          alt={card.summary.title}
                          className="h-48 w-full object-cover sm:h-full"
                          loading="lazy"
                        />
                      </div>
                      {typeof card.summary.rating === 'number' && card.summary.rating > 0 && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-dry-sage-100 px-3 py-1 text-xs font-semibold text-dry-sage-700">
                          ★ {card.summary.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </article>
                )
              })
              ) : (
                <StateCard
                  variant="empty"
                  title="По запросу ничего не найдено"
                  description="Измените фильтры или даты, чтобы увидеть доступные варианты."
                  actionLabel="Сбросить фильтры"
                  onAction={handleResetFilters}
                />
              )}
            </div>

            {meta && meta.total_pages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-dusty-mauve-100 bg-white/90 p-4 text-sm">
                <span className="text-dusty-mauve-500">
                  Страница {meta.page} из {meta.total_pages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(meta.page - 1)}
                    disabled={meta.page <= 1}
                    className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm text-dusty-mauve-700 disabled:opacity-50"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={() => changePage(meta.page + 1)}
                    disabled={meta.page >= meta.total_pages}
                    className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm text-dusty-mauve-700 disabled:opacity-50"
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>

      <ListingPreview
        listingId={selectedListingId}
        summary={selectedSummary}
        initialCheckIn={formState.checkIn}
        initialCheckOut={formState.checkOut}
        initialGuests={initialGuests}
        onNavigate={onNavigate}
        onClose={handleClosePreview}
      />
    </div>
  )
}

function currentPathForRedirect(route: CatalogPageProps['route']) {
  const pathname = route?.pathname || '/catalog'
  const search = route?.search || ''
  return `${pathname}${search}`
}
