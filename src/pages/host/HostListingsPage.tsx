import { useMemo, useState } from 'react'
import { Header } from '../../components/Header'
import { publishHostListing, unpublishHostListing } from '../../lib/hostListingApi'
import { useHostListings } from '../../hooks/useHostListings'
import { withViewTransition } from '../../lib/viewTransitions'
import type { HostListingSummary } from '../../types/listing'

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const statusOptions = [
  { label: 'Все', value: '' },
  { label: 'Черновики', value: 'draft' },
  { label: 'Опубликовано', value: 'published' },
  { label: 'Архив', value: 'archived' },
]

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'Архив',
}

interface HostListingsPageProps {
  onNavigate: (path: string) => void
}

export function HostListingsPage({ onNavigate }: HostListingsPageProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const { data, loading, error, refresh } = useHostListings(statusFilter)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const items = useMemo<HostListingSummary[]>(() => data?.items ?? [], [data])

  const handlePublish = async (id: string) => {
    setActionError(null)
    setActionLoading(id)
    try {
      await publishHostListing(id)
      refresh()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnpublish = async (id: string) => {
    setActionError(null)
    setActionLoading(id)
    try {
      await unpublishHostListing(id)
      refresh()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Ваши объявления</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Мои объявления</h1>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => withViewTransition(() => setStatusFilter(event.target.value))}
              className="rounded-full border border-dusty-mauve-200 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-900"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/host/listings/new'))}
              className="rounded-full bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800"
            >
              Создать объявление
            </button>
          </div>
        </div>

        {loading && <p className="mt-6 text-sm text-dusty-mauve-600">Загрузка...</p>}
        {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}

        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-soft md:grid-cols-[240px_1fr]"
            >
              <div className="relative h-40 overflow-hidden rounded-2xl bg-dusty-mauve-100">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-dusty-mauve-500">Нет фото</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-dusty-mauve-900 shadow">
                  {statusLabels[item.status] || item.status}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-dusty-mauve-900/85 px-3 py-1 text-xs font-semibold text-white">
                  {item.rental_term === 'short_term' ? 'Посуточно' : 'Долгосрочно'}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest text-dry-sage-500">
                    {item.city}, {item.region}
                  </p>
                  <h2 className="text-xl font-semibold text-dusty-mauve-900">{item.title}</h2>
                  <p className="text-sm text-dusty-mauve-500">
                    {item.bedrooms} комн. · {item.area_sq_m} м² · Этаж {item.floor} из {item.floors_total}
                  </p>
                  <p className="text-sm font-semibold text-dusty-mauve-900">{formatRate(item)}</p>
                  <p className="text-xs uppercase text-dry-sage-500">До {item.guests_limit} гостей</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase text-dry-sage-600">
                  <span className="rounded-full bg-dry-sage-50 px-3 py-1">Ремонт {item.renovation_score}/10</span>
                  <span className="rounded-full bg-dry-sage-50 px-3 py-1">Дому {item.building_age_years} лет</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => withViewTransition(() => onNavigate(`/host/listings/${item.id}/edit`))}
                    className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
                  >
                    Редактировать
                  </button>
                  {item.status === 'published' ? (
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => withViewTransition(() => handleUnpublish(item.id))}
                      className="rounded-full border border-dry-sage-400 px-4 py-2 text-sm font-semibold text-dry-sage-700 transition hover:bg-dry-sage-50 disabled:opacity-60"
                    >
                      {actionLoading === item.id ? 'Снимаем...' : 'Снять с публикации'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => withViewTransition(() => handlePublish(item.id))}
                      className="rounded-full bg-dry-sage-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dry-sage-500 disabled:opacity-60"
                    >
                      {actionLoading === item.id ? 'Публикуем...' : 'Опубликовать'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function normalizePriceUnit(unit?: string, rentalTerm?: string) {
  if (unit === 'month' || unit === 'night') {
    return unit
  }
  return rentalTerm === 'long_term' ? 'month' : 'night'
}

function formatRate(item: HostListingSummary) {
  const unit = normalizePriceUnit(item.price_unit, item.rental_term)
  const value = priceFormatter.format(Math.round(item.rate_rub))
  return unit === 'month' ? `${value} / месяц` : `${value} / ночь`
}
