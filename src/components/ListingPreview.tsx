import { useEffect, useState } from 'react'
import { useListingOverview } from '../hooks/useListingOverview'
import { useListingReviews } from '../hooks/useListingReviews'
import { createBooking } from '../lib/bookingApi'
import { ApiError } from '../lib/api'
import { createListingConversation } from '../lib/chatApi'
import type { Listing } from '../types/listing'
import type { Review } from '../types/review'

interface ListingPreviewProps {
  listingId: string | null
  summary: Listing | null
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
  onNavigate?: (path: string, options?: { replace?: boolean }) => void
  onClose: () => void
}

const availabilityFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
})

export function ListingPreview({
  listingId,
  summary,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onNavigate,
  onClose,
}: ListingPreviewProps) {
  const { data, loading, error } = useListingOverview(listingId)
  const {
    data: reviewsData,
    loading: reviewsLoading,
    error: reviewsError,
  } = useListingReviews(listingId, 3)
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? '')
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? '')
  const [guests, setGuests] = useState(initialGuests && initialGuests > 0 ? initialGuests : 1)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    setCheckIn(initialCheckIn ?? '')
    setCheckOut(initialCheckOut ?? '')
    setGuests(initialGuests && initialGuests > 0 ? initialGuests : 1)
    setBookingError(null)
    setBookingSuccess(null)
    setChatError(null)
  }, [initialCheckIn, initialCheckOut, initialGuests, listingId])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!listingId) {
    return null
  }

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      setBookingError('Укажите даты заезда и выезда')
      return
    }
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      setBookingError('Неверный формат дат')
      return
    }
    if (checkOutDate <= checkInDate) {
      setBookingError('Дата выезда должна быть позже заезда')
      return
    }
    setSubmitting(true)
    setBookingError(null)
    setBookingSuccess(null)
    try {
      const guestsCount = guests > 0 ? guests : 1
      await createBooking({
        listing_id: listingId,
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
        guests: guestsCount,
      })
      setBookingSuccess('Бронирование создано')
      if (onNavigate) {
        onNavigate('/me/bookings')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          const currentPath =
            typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/catalog'
          const redirectTarget = `/login?redirect=${encodeURIComponent(currentPath)}`
          setBookingError('Нужна авторизация, чтобы оформить бронь')
          if (onNavigate) {
            onNavigate(redirectTarget)
          }
          return
        }
        setBookingError(err.message)
        return
      }
      setBookingError('Не удалось создать бронь. Попробуйте позже.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContactHost = async () => {
    setChatError(null)
    setChatLoading(true)
    try {
      const response = await createListingConversation(listingId)
      const conversationId = response.data.id
      if (onNavigate) {
        onNavigate(`/me/chats/${conversationId}`)
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/catalog'
        const redirectTarget = `/login?redirect=${encodeURIComponent(currentPath)}`
        setChatError('Войдите, чтобы написать арендодателю')
        if (onNavigate) {
          onNavigate(redirectTarget)
        }
        return
      }
      setChatError((err as Error).message)
    } finally {
      setChatLoading(false)
    }
  }

  const ratingValue =
    typeof data?.rating === 'number'
      ? data.rating
      : typeof summary?.rating === 'number'
        ? summary.rating
        : null
  const amenities = (data?.amenities?.length ? data.amenities : summary?.features) ?? []
  const chips = [
    summary?.price,
    summary?.area,
    data?.guests_limit ? `${data.guests_limit} гостя` : null,
    data?.min_nights && data?.max_nights ? `${data.min_nights}–${data.max_nights} ночей` : null,
  ].filter(Boolean) as string[]

  const title = data?.title ?? summary?.title ?? 'Объявление Rentme'
  const location =
    (data?.address?.line1
      ? [data.address.line1, data.address.city].filter(Boolean).join(' · ')
      : summary?.location) ?? 'Адрес уточняется'
  const description =
    data?.description ??
    'Описание появится позже. Мы проверяем данные и готовим объявление для гостей.'

  const availabilityBlocks = data?.calendar?.blocks ?? []
  const highlightedBlocks = availabilityBlocks.slice(0, 2)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-dusty-mauve-900/40 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl rounded-3xl bg-white/95 p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-dusty-mauve-900/10 px-3 py-1 text-sm font-semibold text-dusty-mauve-700 transition hover:bg-dusty-mauve-900/20"
        >
          Закрыть
        </button>

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase text-dry-sage-600">Краткое описание</p>
              <h3 className="text-2xl font-semibold text-dusty-mauve-900">{title}</h3>
              <p className="text-sm text-dusty-mauve-500">{location}</p>
            </div>

            <p className="text-sm text-dusty-mauve-700">{description}</p>

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-dusty-mauve-600">
                {chips.map((chip) => (
                  <span key={chip} className="rounded-full bg-dusty-mauve-50 px-3 py-1">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {ratingValue && ratingValue > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-dusty-mauve-900">
                <span className="inline-flex items-center gap-1 rounded-full bg-dry-sage-100 px-3 py-1 text-dry-sage-800">
                  {ratingValue.toFixed(1)} ?
                </span>
                {reviewsData?.total ? (
                  <span className="text-xs font-normal uppercase text-dry-sage-600">{reviewsData.total} отзыв(ов)</span>
                ) : (
                  <span className="text-xs font-normal uppercase text-dry-sage-600">Ещё нет отзывов</span>
                )}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs uppercase text-dry-sage-600">Отзывы гостей</p>
              {reviewsLoading ? (
                <div className="h-16 animate-pulse rounded-2xl bg-dusty-mauve-100/40" />
              ) : reviewsError ? (
                <p className="text-sm text-red-600">{reviewsError}</p>
              ) : reviewsData?.items?.length ? (
                <ul className="space-y-2">
                  {reviewsData.items.map((review: Review) => (
                    <li
                      key={review.id}
                      className="rounded-2xl border border-dusty-mauve-100 bg-white/80 p-3 text-sm text-dusty-mauve-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-dusty-mauve-900">{review.rating} ?</span>
                        <span className="text-xs text-dusty-mauve-500">
                          {new Date(review.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-dusty-mauve-700">{review.text || 'Без текста'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-dusty-mauve-500">Пока нет отзывов — вы можете стать первым гостем.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase text-dry-sage-600">Удобства</p>
              {loading ? (
                <div className="h-16 animate-pulse rounded-2xl bg-dusty-mauve-100/40" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(amenities.slice(0, 6) as string[]).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-dusty-mauve-100 px-3 py-1 text-sm text-dusty-mauve-700"
                    >
                      {item}
                    </span>
                  ))}
                  {amenities.length === 0 && (
                    <span className="text-sm text-dusty-mauve-500">Удобства будут указаны позже.</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-dusty-mauve-100 bg-white/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase text-dry-sage-600">Доступность</p>
                {data?.availability_window && (
                  <p className="text-xs text-dusty-mauve-500">
                    {formatRange(data.availability_window.from, data.availability_window.to)}
                  </p>
                )}
              </div>
              {loading ? (
                <div className="h-12 animate-pulse rounded-xl bg-dusty-mauve-100/50" />
              ) : highlightedBlocks.length > 0 ? (
                <ul className="space-y-2 text-sm text-dusty-mauve-600">
                  {highlightedBlocks.map((block) => (
                    <li key={`${block.from}-${block.to}`} className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-dry-sage-500" />
                      <span>
                        {formatRange(block.from, block.to)} ·{' '}
                        <span className="uppercase text-xs text-dusty-mauve-500">{block.reason}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-dusty-mauve-600">Нет блокировок календаря — даты свободны.</p>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-dusty-mauve-100 bg-white/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase text-dry-sage-600">Бронирование</p>
                {bookingSuccess && <span className="text-xs font-semibold text-dry-sage-700">{bookingSuccess}</span>}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs uppercase text-dry-sage-600">
                  <span>Заезд</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    className="rounded-xl border border-dusty-mauve-100 bg-white px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs uppercase text-dry-sage-600">
                  <span>Выезд</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className="rounded-xl border border-dusty-mauve-100 bg-white px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs uppercase text-dry-sage-600">
                  <span>Гостей</span>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
                    className="rounded-xl border border-dusty-mauve-100 bg-white px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
                  />
                </label>
              </div>
              {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800 disabled:opacity-50"
                >
                  {submitting ? 'Отправляем заявку...' : 'Забронировать'}
                </button>
                <p className="text-xs text-dusty-mauve-500">
                  Укажем точную цену после проверки дат и доступности.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-cream-200 bg-cream-50/70 p-3 text-sm text-dusty-mauve-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleContactHost}
                disabled={chatLoading}
                className="inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800 disabled:opacity-60"
              >
                {chatLoading ? 'Открываем чат...' : 'Написать арендодателю'}
              </button>
              <a
                href={`mailto:care@rentme.app?subject=Rentme%20-%20Listing%20${listingId}`}
                className="inline-flex items-center justify-center rounded-full border border-dusty-mauve-200 px-5 py-3 text-sm font-semibold text-dusty-mauve-700 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
              >
                Написать на почту
              </a>
              <a
                href="https://t.me/rentme"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-dusty-mauve-200 px-5 py-3 text-sm font-semibold text-dusty-mauve-700 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
              >
                Написать в Telegram
              </a>
            </div>
            {chatError && <p className="text-sm text-red-600">{chatError}</p>}
          </div>

          {summary?.thumbnail && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-3xl">
                <img src={summary.thumbnail} alt={summary.title} className="h-60 w-full object-cover sm:h-full" />
              </div>
              <p className="text-xs uppercase text-dusty-mauve-500">
                ID объявления · <span className="font-mono">{summary.id}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatRange(from: string, to: string) {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 'даты уточняются'
  }
  const fromLabel = availabilityFormatter.format(fromDate)
  const toLabel = availabilityFormatter.format(toDate)
  return `${fromLabel} – ${toLabel}`
}
