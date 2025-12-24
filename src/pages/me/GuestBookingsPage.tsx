import { useMemo, useRef, useState } from 'react'
import { Header } from '../../components/Header'
import { useGuestBookings } from '../../hooks/useGuestBookings'
import { submitReview, updateReview } from '../../lib/reviewsApi'
import { createBookingConversation } from '../../lib/chatApi'
import { ApiError } from '../../lib/api'
import { withViewTransition } from '../../lib/viewTransitions'
import { StateCard } from '../../components/StateCard'
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

type BookingTab = 'upcoming' | 'past' | 'cancelled'

const bookingTabLabels: Record<BookingTab, string> = {
  upcoming: 'Предстоящие',
  past: 'Прошлые',
  cancelled: 'Отмененные',
}

interface ReviewFormState {
  rating: string
  text: string
  submitting?: boolean
  error?: string | null
  success?: boolean
  editing?: boolean
}

interface GuestBookingsPageProps {
  onNavigate: (path: string) => void
}

export function GuestBookingsPage({ onNavigate }: GuestBookingsPageProps) {
  const { data, loading, error, refresh } = useGuestBookings()
  const bookings = data?.items ?? []
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming')
  const [reviewForms, setReviewForms] = useState<Record<string, ReviewFormState>>({})
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const bookingsRef = useRef<HTMLDivElement | null>(null)

  const groupedBookings = useMemo(() => groupBookings(bookings), [bookings])
  const visibleBookings = groupedBookings[activeTab]
  const reviewTargets = useMemo(() => bookings.filter(needsReview), [bookings])
  const emptyState = useMemo(() => {
    if (visibleBookings.length > 0) {
      return null
    }
    if (bookings.length === 0) {
      return {
        title: 'Пока нет бронирований',
        description: 'Подберите даты и город в каталоге, чтобы оформить первую поездку.',
        actionLabel: 'Перейти в каталог',
      }
    }
    if (activeTab === 'upcoming') {
      return {
        title: 'Нет предстоящих бронирований',
        description: 'Выберите новое жилье или переключитесь на прошлые поездки.',
        actionLabel: 'Подобрать жильё',
      }
    }
    if (activeTab === 'past') {
      return {
        title: 'Пока нет завершенных поездок',
        description: 'Когда поездка завершится, вы сможете оставить отзыв здесь.',
        actionLabel: 'Перейти в каталог',
      }
    }
    return {
      title: 'Нет отмененных бронирований',
      description: 'Здесь будут отображаться отмененные или отклоненные заявки.',
      actionLabel: 'Перейти в каталог',
    }
  }, [activeTab, bookings.length, visibleBookings.length])

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
      updateFormState(booking.id, { success: true, editing: false })
      withViewTransition(refresh)
    } catch (err) {
      updateFormState(booking.id, { error: (err as Error).message, success: false })
    } finally {
      updateFormState(booking.id, { submitting: false })
    }
  }

  const handleUpdateReview = async (booking: GuestBookingSummary) => {
    const form = getFormState(booking.id)
    const ratingValue = Number(form.rating)
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      updateFormState(booking.id, { error: 'Поставьте оценку от 1 до 5' })
      return
    }
    if (!booking.review_id) {
      updateFormState(booking.id, { error: 'Не нашли отзыв для редактирования.' })
      return
    }
    updateFormState(booking.id, { submitting: true, error: null })
    try {
      await updateReview(booking.review_id, ratingValue, form.text?.trim() || undefined)
      updateFormState(booking.id, { editing: false })
      withViewTransition(refresh)
    } catch (err) {
      updateFormState(booking.id, { error: (err as Error).message })
    } finally {
      updateFormState(booking.id, { submitting: false })
    }
  }

  const handleStartEditReview = (booking: GuestBookingSummary) => {
    updateFormState(booking.id, {
      rating: String(booking.review_rating ?? 5),
      text: booking.review_text ?? '',
      editing: true,
      error: null,
      success: false,
    })
  }

  const handleCancelEditReview = (bookingId: string) => {
    updateFormState(bookingId, { editing: false, error: null })
  }

  const handleOpenChat = async (booking: GuestBookingSummary) => {
    setChatError(null)
    setChatLoadingId(booking.id)
    try {
      const response = await createBookingConversation(booking.id)
      withViewTransition(() => onNavigate(`/me/chats/${response.data.id}`))
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        const redirectTarget = `/login?redirect=${encodeURIComponent('/me/bookings')}`
        setChatError('Нужна авторизация, чтобы открыть чат')
        withViewTransition(() => onNavigate(redirectTarget))
      } else {
        setChatError((err as Error).message)
      }
    } finally {
      setChatLoadingId(null)
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

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-soft">
            <p className="text-xs uppercase tracking-widest text-dry-sage-500">Сообщения</p>
            <h2 className="mt-2 text-xl font-semibold text-dusty-mauve-900">Мои чаты</h2>
            <p className="mt-2 text-sm text-dusty-mauve-500">
              Быстрый переход в список диалогов с хостами и администраторами.
            </p>
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/me/chats'))}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
            >
              Перейти в чаты
            </button>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-soft">
            <p className="text-xs uppercase tracking-widest text-dry-sage-500">Отзывы</p>
            <h2 className="mt-2 text-xl font-semibold text-dusty-mauve-900">
              {reviewTargets.length > 0 ? 'Нужно оставить отзывы' : 'Пока всё оценено'}
            </h2>
            <p className="mt-2 text-sm text-dusty-mauve-500">
              {reviewTargets.length > 0
                ? `У вас ${reviewTargets.length} бронирований без отзыва.`
                : 'Когда завершите поездку, здесь появится напоминание.'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (reviewTargets.length > 0) {
                  setActiveTab('past')
                  bookingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else {
                  withViewTransition(() => onNavigate('/catalog'))
                }
              }}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
            >
              {reviewTargets.length > 0 ? 'Перейти к отзывам' : 'Подобрать жильё'}
            </button>
          </div>
        </div>

        {chatError && (
          <div className="mt-6">
            <StateCard variant="error" title="Чат временно недоступен" description={chatError} />
          </div>
        )}
        {error && !loading && (
          <div className="mt-4">
            <StateCard
              variant="error"
              title="Не удалось загрузить бронирования"
              description={error}
              actionLabel="Повторить"
              onAction={() => withViewTransition(refresh)}
            />
          </div>
        )}
        {loading && (
          <div className="mt-4">
            <StateCard
              variant="loading"
              title="Загружаем бронирования"
              description="Проверяем актуальные поездки и статусы."
            />
          </div>
        )}

        <div className="mt-10" ref={bookingsRef}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-dry-sage-400">Мои брони</p>
              <h2 className="text-2xl font-semibold text-dusty-mauve-900">История поездок</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(bookingTabLabels) as BookingTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'bg-dusty-mauve-900 text-dusty-mauve-50'
                      : 'border border-dusty-mauve-200 text-dusty-mauve-900 hover:border-dry-sage-400'
                  }`}
                >
                  {bookingTabLabels[tab]} · {groupedBookings[tab].length}
                </button>
              ))}
            </div>
          </div>

          {!loading && !error && emptyState && (
            <div className="mt-6">
              <StateCard
                variant="empty"
                title={emptyState.title}
                description={emptyState.description}
                actionLabel={emptyState.actionLabel}
                onAction={() => withViewTransition(() => onNavigate('/catalog'))}
              />
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {visibleBookings.map((booking) => {
              const isChatLoadingForBooking = chatLoadingId === booking.id
              return (
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
                        {formatStayLabel(booking) && <span className="ml-2 text-dusty-mauve-400">·</span>}
                        {formatStayLabel(booking)}
                        <span className="ml-2 text-dusty-mauve-400">·</span>
                        {booking.guests} гостя
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2 text-dusty-mauve-900">
                      <p className="text-2xl font-semibold">{formatMoney(booking)}</p>
                      <span className="text-sm text-dusty-mauve-500">за бронирование</span>
                      <span className="text-sm text-dusty-mauve-400">{formatPriceUnitLabel(booking)}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-dry-sage-400">
                      Создано {new Date(booking.created_at).toLocaleDateString('ru-RU')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenChat(booking)}
                        disabled={isChatLoadingForBooking}
                        className="inline-flex items-center rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400 disabled:opacity-60"
                      >
                        {isChatLoadingForBooking ? 'Чат загружается...' : 'Перейти в чат'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          withViewTransition(() => onNavigate(`/catalog?listing_id=${booking.listing.id}`))
                        }
                        className="inline-flex items-center rounded-full border border-dry-sage-400 px-4 py-2 text-sm font-semibold text-dry-sage-700 transition hover:bg-dry-sage-50"
                      >
                        Открыть объявление
                      </button>
                    </div>
                    {renderReviewBlock(
                      booking,
                      getFormState(booking.id),
                      handleSubmitReview,
                      handleUpdateReview,
                      handleStartEditReview,
                      handleCancelEditReview,
                      updateFormState,
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderReviewBlock(
  booking: GuestBookingSummary,
  form: ReviewFormState,
  onSubmit: (booking: GuestBookingSummary) => void,
  onUpdate: (booking: GuestBookingSummary) => void,
  onStartEdit: (booking: GuestBookingSummary) => void,
  onCancelEdit: (bookingId: string) => void,
  updateForm: (id: string, patch: Partial<ReviewFormState>) => void,
) {
  const stayFinished = new Date(booking.check_out).getTime() <= Date.now()
  const reviewSent = booking.review_submitted || Boolean(booking.review_id) || form.success
  const canReview = (booking.can_review ?? stayFinished) && !reviewSent
  const isEditMode = Boolean(form.editing && booking.review_id)

  if (reviewSent && !isEditMode) {
    if (booking.review_id) {
      const ratingLabel = booking.review_rating ? `${booking.review_rating}/5` : '—'
      const hasText = Boolean(booking.review_text?.trim())
      return (
        <div className="rounded-2xl border border-dry-sage-100 bg-dry-sage-50/60 px-4 py-3 text-sm text-dry-sage-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-dry-sage-500">Отзыв</p>
              <p className="mt-1 text-sm text-dry-sage-700">Оценка: {ratingLabel}</p>
              {hasText ? (
                <p className="mt-2 text-sm text-dry-sage-700">{booking.review_text}</p>
              ) : (
                <p className="mt-2 text-sm text-dry-sage-600">Отзыв без текста</p>
              )}
              {booking.review_created_at && (
                <p className="mt-2 text-xs text-dry-sage-500">
                  Оставлен {new Date(booking.review_created_at).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onStartEdit(booking)}
              className="inline-flex items-center rounded-full border border-dry-sage-300 px-3 py-1 text-xs font-semibold text-dry-sage-700 transition hover:border-dry-sage-400"
            >
              Редактировать
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="rounded-2xl border border-dry-sage-100 bg-dry-sage-50/60 px-4 py-3 text-sm text-dry-sage-800">
        Отзыв отправлен, спасибо!
      </div>
    )
  }

  if (!canReview && !isEditMode) {
    return null
  }

  return (
    <div className="rounded-2xl border border-dusty-mauve-100 bg-dusty-mauve-50/70 p-4 text-sm">
      <p className="font-semibold text-dusty-mauve-900">{isEditMode ? 'Редактировать отзыв' : 'Оставить отзыв'}</p>
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
        placeholder={isEditMode ? 'Обновите отзыв' : 'Поделитесь, что понравилось или что улучшить'}
        className="mt-3 w-full rounded-2xl border border-dusty-mauve-100 bg-white px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-400"
        rows={3}
      />
      {form.error && <p className="mt-2 text-xs text-red-600">{form.error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={form.submitting}
          onClick={() => (isEditMode ? onUpdate(booking) : onSubmit(booking))}
          className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
        >
          {form.submitting ? 'Сохраняем...' : isEditMode ? 'Сохранить изменения' : 'Отправить отзыв'}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={() => onCancelEdit(booking.id)}
            className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-700 transition hover:border-dry-sage-400"
          >
            Отменить
          </button>
        )}
        <p className="text-xs text-dusty-mauve-500">
          {isEditMode ? 'Редактирование доступно в любое время (демо).' : 'Доступно после завершения проживания'}
        </p>
      </div>
    </div>
  )
}

function formatDateRange(booking: GuestBookingSummary) {
  const startDate = new Date(booking.check_in)
  if (Number.isNaN(startDate.getTime())) {
    return 'Даты уточняются'
  }
  const start = dateFormatter.format(startDate)
  if (booking.price_unit === 'month' && booking.months && booking.months > 0) {
    return `Заезд ${start}`
  }
  const endDate = new Date(booking.check_out)
  if (Number.isNaN(endDate.getTime())) {
    return `Заезд ${start}`
  }
  const end = dateFormatter.format(endDate)
  return `${start} - ${end}`
}

function formatStayLabel(booking: GuestBookingSummary) {
  if (booking.price_unit === 'month' && booking.months && booking.months > 0) {
    return `на ${booking.months} мес.`
  }
  return ''
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

function formatPriceUnitLabel(booking: GuestBookingSummary) {
  const unit = normalizePriceUnit(booking.price_unit)
  if (unit === 'month') {
    return 'тариф: месяц'
  }
  if (unit === 'night') {
    return 'тариф: ночь'
  }
  return 'тариф уточняется'
}

function normalizePriceUnit(unit?: string) {
  if (unit === 'month' || unit === 'night') {
    return unit
  }
  return ''
}

function needsReview(booking: GuestBookingSummary) {
  const stayFinished = new Date(booking.check_out).getTime() <= Date.now()
  const reviewSent = booking.review_submitted
  const canReview = booking.can_review ?? stayFinished
  return canReview && !reviewSent
}

function groupBookings(bookings: GuestBookingSummary[]) {
  const result: Record<BookingTab, GuestBookingSummary[]> = {
    upcoming: [],
    past: [],
    cancelled: [],
  }
  bookings.forEach((booking) => {
    result[resolveBookingBucket(booking)].push(booking)
  })
  return result
}

function resolveBookingBucket(booking: GuestBookingSummary): BookingTab {
  const status = booking.status
  if (status === 'DECLINED' || status === 'CANCELLED') {
    return 'cancelled'
  }
  if (status === 'CHECKED_OUT' || status === 'EXPIRED' || status === 'NO_SHOW') {
    return 'past'
  }
  const checkout = new Date(booking.check_out)
  if (!Number.isNaN(checkout.getTime()) && checkout.getTime() < Date.now()) {
    return 'past'
  }
  return 'upcoming'
}
