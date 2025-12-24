import { useState } from 'react'
import { Header } from '../../components/Header'
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
  PENDING: 'Ожидает подтверждения',
  ACCEPTED: 'Принята',
  CONFIRMED: 'Подтверждена',
  DECLINED: 'Отклонена',
  CANCELLED: 'Отменена',
  CHECKED_IN: 'Заезд состоялся',
  CHECKED_OUT: 'Выезд завершен',
  EXPIRED: 'Истекла',
  NO_SHOW: 'Неявка гостя',
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

        {loading && <p className="mt-8 text-sm text-dusty-mauve-500">Загружаем заявки...</p>}
        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>
        )}
        {chatError && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {chatError}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dusty-mauve-100 bg-white/80 p-8 text-center">
            <p className="text-lg font-semibold text-dusty-mauve-900">Пока нет заявок на бронирование.</p>
            <p className="mt-2 text-sm text-dusty-mauve-500">
              Как только гость отправит запрос, он появится здесь — вы сможете подтвердить или отклонить бронь.
            </p>
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
                  <div className="flex items-baseline gap-2 text-dusty-mauve-900">
                    <p className="text-2xl font-semibold">{formatMoney(booking)}</p>
                    <span className="text-sm text-dusty-mauve-500">к оплате</span>
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
  const start = dateFormatter.format(new Date(booking.check_in))
  const end = dateFormatter.format(new Date(booking.check_out))
  return `${start} - ${end}`
}

function formatStayLabel(booking: HostBookingSummary) {
  if (booking.price_unit === 'month' && booking.months && booking.months > 0) {
    return `${booking.months} мес.`
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
