import { useState } from 'react'
import { Header } from '../../components/Header'
import { StateCard } from '../../components/StateCard'
import { useHostBookings } from '../../hooks/useHostBookings'
import { confirmHostBooking, declineHostBooking } from '../../lib/hostBookingApi'
import { createBookingConversation } from '../../lib/chatApi'
import { ApiError } from '../../lib/api'
import { withViewTransition } from '../../lib/viewTransitions'
import type { HostBookingSummary } from '../../types/booking'

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

interface HostBookingsPageProps {
  onNavigate: (path: string) => void
}

interface ActionState {
  loading?: boolean
  error?: string | null
}

export function HostBookingsPage({ onNavigate }: HostBookingsPageProps) {
  const { data, loading, error, refresh } = useHostBookings()
  const bookings = data?.items ?? []
  const [actions, setActions] = useState<Record<string, ActionState>>({})
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)

  const updateAction = (bookingId: string, patch: ActionState) => {
    setActions((prev) => ({ ...prev, [bookingId]: { ...prev[bookingId], ...patch } }))
  }

  const handleConfirm = async (booking: HostBookingSummary) => {
    updateAction(booking.id, { loading: true, error: null })
    try {
      await confirmHostBooking(booking.id)
      withViewTransition(refresh)
    } catch (err) {
      updateAction(booking.id, { error: (err as Error).message })
    } finally {
      updateAction(booking.id, { loading: false })
    }
  }

  const handleDecline = async (booking: HostBookingSummary) => {
    updateAction(booking.id, { loading: true, error: null })
    try {
      await declineHostBooking(booking.id)
      withViewTransition(refresh)
    } catch (err) {
      updateAction(booking.id, { error: (err as Error).message })
    } finally {
      updateAction(booking.id, { loading: false })
    }
  }

  const handleOpenChat = async (booking: HostBookingSummary) => {
    setChatError(null)
    setChatLoadingId(booking.id)
    try {
      const response = await createBookingConversation(booking.id)
      withViewTransition(() => onNavigate(`/me/chats/${response.data.id}`))
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        const redirectTarget = `/login?redirect=${encodeURIComponent('/host/bookings')}`
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
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Брони гостей</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Запросы на бронирование</h1>
          </div>
          <button
            type="button"
            onClick={() => withViewTransition(refresh)}
            className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
          >
            Обновить
          </button>
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
              title="Не удалось загрузить заявки"
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
              title="Загружаем заявки"
              description="Проверяем новые запросы от гостей."
            />
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="mt-6">
            <StateCard
              variant="empty"
              title="Пока нет заявок на бронирование"
              description="Когда гость отправит запрос, он появится в этом списке."
              actionLabel="Создать объявление"
              onAction={() => withViewTransition(() => onNavigate('/host/listings/new'))}
            />
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {bookings.map((booking) => {
            const actionState = actions[booking.id] || {}
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
                      {booking.guests} гостей
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-dusty-mauve-700">
                    <span className="rounded-full bg-white/60 px-3 py-1">
                      Гость: <span className="font-mono text-xs">{booking.guest_id}</span>
                    </span>
                    <span className="text-xs uppercase tracking-widest text-dry-sage-400">
                      Создано {new Date(booking.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2 text-dusty-mauve-900">
                    <p className="text-2xl font-semibold">{formatMoney(booking)}</p>
                    <span className="text-sm text-dusty-mauve-500">к оплате</span>
                    <span className="text-sm text-dusty-mauve-400">{formatPriceUnitLabel(booking)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenChat(booking)}
                    disabled={chatLoadingId === booking.id}
                    className="inline-flex w-fit items-center rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400 disabled:opacity-60"
                  >
                    {chatLoadingId === booking.id ? 'Открываем чат...' : 'Перейти в чат'}
                  </button>
                  {actionState.error && <p className="text-sm text-red-600">{actionState.error}</p>}
                  {booking.status === 'PENDING' && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={actionState.loading}
                        onClick={() => handleConfirm(booking)}
                        className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
                      >
                        Подтвердить
                      </button>
                      <button
                        type="button"
                        disabled={actionState.loading}
                        onClick={() => handleDecline(booking)}
                        className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-700 hover:border-dry-sage-400"
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatDateRange(booking: HostBookingSummary) {
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

function formatStayLabel(booking: HostBookingSummary) {
  if (booking.price_unit === 'month' && booking.months && booking.months > 0) {
    return `на ${booking.months} мес.`
  }
  return ''
}

function formatMoney(booking: HostBookingSummary) {
  const currency = booking.total.currency || 'RUB'
  const amount = booking.total.amount ?? 0
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
  return formatter.format(Math.round(amount))
}

function formatPriceUnitLabel(booking: HostBookingSummary) {
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
