import { Header } from '../../components/Header'
import { useGuestBookings } from '../../hooks/useGuestBookings'
import type { GuestBookingSummary } from '../../types/booking'
import { withViewTransition } from '../../lib/viewTransitions'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
})

const statusLabels: Record<string, string> = {
  PENDING: 'В ожидании',
  ACCEPTED: 'Одобрено',
  CONFIRMED: 'Подтверждено',
  DECLINED: 'Отклонено',
  CANCELLED: 'Отменено',
  CHECKED_IN: 'Гость заехал',
  CHECKED_OUT: 'Завершено',
  EXPIRED: 'Истекло',
  NO_SHOW: 'Не приехали',
}

interface GuestBookingsPageProps {
  onNavigate: (path: string) => void
}

export function GuestBookingsPage({ onNavigate }: GuestBookingsPageProps) {
  const { data, loading, error, refresh } = useGuestBookings()
  const bookings = data?.items ?? []

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Личный кабинет</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Мои поездки</h1>
          </div>
          <button
            type="button"
            onClick={() => withViewTransition(refresh)}
            className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
          >
            Обновить список
          </button>
        </div>

        {loading && <p className="mt-8 text-sm text-dusty-mauve-500">Загружаем ваши бронирования...</p>}
        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dusty-mauve-100 bg-white/80 p-8 text-center">
            <p className="text-lg font-semibold text-dusty-mauve-900">Пока нет активных поездок</p>
            <p className="mt-2 text-sm text-dusty-mauve-500">Найдите жильё в каталоге и забронируйте новое путешествие.</p>
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
                    <span className="ml-2 text-dusty-mauve-400">•</span>
                    {booking.guests} гостей
                  </span>
                </div>
                <div className="flex items-baseline gap-2 text-dusty-mauve-900">
                  <p className="text-2xl font-semibold">{formatMoney(booking)}</p>
                  <span className="text-sm text-dusty-mauve-500">за поездку</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-dry-sage-400">
                  Создано {new Date(booking.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </article>
          ))}
        </div>
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
  return formatter.format(Math.round(amount / 100))
}
