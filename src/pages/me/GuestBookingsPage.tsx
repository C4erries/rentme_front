import { useState } from 'react'
import { Header } from '../../components/Header'
import { useGuestBookings } from '../../hooks/useGuestBookings'
import { submitReview } from '../../lib/reviewsApi'
import { withViewTransition } from '../../lib/viewTransitions'
import type { GuestBookingSummary } from '../../types/booking'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
})

const statusLabels: Record<string, string> = {
  PENDING: 'Ждет подтверждения',
  ACCEPTED: 'Принята',
  CONFIRMED: 'Подтверждена',
  DECLINED: 'Отклонена',
  CANCELLED: 'Отменена',
  CHECKED_IN: 'Заселение',
  CHECKED_OUT: 'Завершена',
  EXPIRED: 'Истекла',
  NO_SHOW: 'Гость не приехал',
}

interface ReviewFormState {
  rating: string
  text: string
  submitting?: boolean
  error?: string | null
  success?: boolean
}

interface GuestBookingsPageProps {
  onNavigate: (path: string) => void
}

export function GuestBookingsPage({ onNavigate }: GuestBookingsPageProps) {
  const { data, loading, error, refresh } = useGuestBookings()
  const bookings = data?.items ?? []
  const [reviewForms, setReviewForms] = useState<Record<string, ReviewFormState>>({})

  const getFormState = (bookingId: string): ReviewFormState => {
    return reviewForms[bookingId] || { rating: '5', text: '' }
  }

  const updateFormState = (bookingId: string, patch: Partial<ReviewFormState>) => {
    setReviewForms((prev) => ({
      ...prev,
      [bookingId]: { ...getFormState(bookingId), ...patch },
    }))
  }

  const handleSubmitReview = async (booking: GuestBookingSummary) => {
    const form = getFormState(booking.id)
    const ratingValue = Number(form.rating)
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      updateFormState(booking.id, { error: 'Поставьте оценку от 1 до 5' })
      return
    }
    updateFormState(booking.id, { submitting: true, error: null })
    try {
      await submitReview(booking.id, ratingValue, form.text?.trim() || undefined)
      updateFormState(booking.id, { success: true })
      withViewTransition(refresh)
    } catch (err) {
      updateFormState(booking.id, { error: (err as Error).message, success: false })
    } finally {
      updateFormState(booking.id, { submitting: false })
    }
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">ваши поездки</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Мои брони</h1>
          </div>
          <button
            type="button"
            onClick={() => withViewTransition(refresh)}
            className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
          >
            Обновить список
          </button>
        </div>

        {loading && <p className="mt-8 text-sm text-dusty-mauve-500">Загружаем бронирования...</p>}
        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dusty-mauve-100 bg-white/80 p-8 text-center">
            <p className="text-lg font-semibold text-dusty-mauve-900">У вас пока нет активных бронирований</p>
            <p className="mt-2 text-sm text-dusty-mauve-500">
              Подберите дату и город в каталоге, мы покажем доступные квартиры, лофты и дома.
            </p>
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/catalog'))}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
            >
              Перейти в каталог
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-soft"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${booking.listing.thumbnail_url || ''})` }}
              />
              <div className="flex flex-col gap-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-dry-sage-500">
                    {booking.listing.city}, {booking.listing.region || booking.listing.country}
                  </p>
                  <h2 className="text-xl font-semibold text-dusty-mauve-900">{booking.listing.title}</h2>
                  <p className="text-sm text-dusty-mauve-500">{booking.listing.address_line1}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-dusty-mauve-600">
                  <span className="rounded-full bg-dry-sage-100 px-3 py-1 text-dry-sage-700">
                    {statusLabels[booking.status] ?? booking.status}
                  </span>
                  <span>
                    {formatDateRange(booking)}
                    <span className="ml-2 text-dusty-mauve-400">·</span>
                    {booking.guests} гостя
                  </span>
                </div>
                <div className="flex items-baseline gap-2 text-dusty-mauve-900">
                  <p className="text-2xl font-semibold">{formatMoney(booking)}</p>
                  <span className="text-sm text-dusty-mauve-500">за бронирование</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-dry-sage-400">
                  Создано {new Date(booking.created_at).toLocaleDateString('ru-RU')}
                </p>
                {renderReviewBlock(booking, getFormState(booking.id), handleSubmitReview, updateFormState)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderReviewBlock(
  booking: GuestBookingSummary,
  form: ReviewFormState,
  onSubmit: (booking: GuestBookingSummary) => void,
  updateForm: (id: string, patch: Partial<ReviewFormState>) => void,
) {
  const stayFinished = new Date(booking.check_out).getTime() <= Date.now()
  const reviewSent = booking.review_submitted || form.success
  const canReview = (booking.can_review ?? stayFinished) && !reviewSent

  if (reviewSent) {
    return (
      <div className="rounded-2xl border border-dry-sage-100 bg-dry-sage-50/60 px-4 py-3 text-sm text-dry-sage-800">
        Отзыв отправлен, спасибо!
      </div>
    )
  }

  if (!canReview) {
    return null
  }

  return (
    <div className="rounded-2xl border border-dusty-mauve-100 bg-dusty-mauve-50/70 p-4 text-sm">
      <p className="font-semibold text-dusty-mauve-900">Оставить отзыв</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex items-center gap-2">
          <span className="text-xs uppercase text-dry-sage-600">Оценка</span>
          <select
            value={form.rating}
            onChange={(event) => updateForm(booking.id, { rating: event.target.value })}
            className="rounded-full border border-dusty-mauve-200 bg-white px-3 py-1 text-sm text-dusty-mauve-900"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} ★
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        value={form.text}
        onChange={(event) => updateForm(booking.id, { text: event.target.value })}
        placeholder="Поделитесь, что понравилось или что улучшить"
        className="mt-3 w-full rounded-2xl border border-dusty-mauve-100 bg-white px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
        rows={3}
      />
      {form.error && <p className="mt-2 text-xs text-red-600">{form.error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={form.submitting}
          onClick={() => onSubmit(booking)}
          className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
        >
          {form.submitting ? 'Отправляем...' : 'Отправить отзыв'}
        </button>
        <p className="text-xs text-dusty-mauve-500">Доступно после завершения проживания</p>
      </div>
    </div>
  )
}

function formatDateRange(booking: GuestBookingSummary) {
  const start = dateFormatter.format(new Date(booking.check_in))
  const end = dateFormatter.format(new Date(booking.check_out))
  return `${start} — ${end}`
}

function formatMoney(booking: GuestBookingSummary) {
  const currency = booking.total.currency || 'RUB'
  const amount = booking.total.amount ?? 0
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
  return formatter.format(Math.round(amount))
}
