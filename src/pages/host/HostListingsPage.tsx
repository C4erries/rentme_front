import { useMemo, useState } from 'react'
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
  { label: 'Опубликованные', value: 'published' },
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
      await refresh()
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
      await refresh()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="bg-dusty-mauve-50 min-h-screen pb-16">
      <div className="container py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Хост-панель</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Мои объявления</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-white/40 bg-white/80 px-4 py-2 text-sm text-dusty-mauve-800 shadow-soft"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/'))}
              className="rounded-full border border-dusty-mauve-300 px-6 py-3 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dusty-mauve-400"
            >
              Вернуться на главную
            </button>
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/host/listings/new'))}
              className="rounded-full bg-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
            >
              Создать объявление
            </button>
          </div>
        </div>

        {loading && (
          <p className="mt-8 text-sm text-dusty-mauve-500">Загружаем объявления...</p>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            Ошибка: {error}
          </div>
        )}
        {actionError && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {!loading && items.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dusty-mauve-200 bg-white/60 p-8 text-center">
              <p className="text-lg font-semibold text-dusty-mauve-900">Нет объявлений</p>
              <p className="mt-2 text-sm text-dusty-mauve-500">
                Начните с создания нового объявления и заполните все этапы мастера.
              </p>
              <button
                type="button"
                onClick={() => withViewTransition(() => onNavigate('/host/listings/new'))}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-dusty-mauve-50"
              >
                Создать объявление
              </button>
            </div>
          )}
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-soft"
            >
              <div
                className="h-40 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${item.photos?.[0] || item.thumbnail_url || ''})`,
                }}
              />
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-dry-sage-500">
                    {item.city}, {item.region || item.country}
                  </p>
                  <h2 className="text-xl font-semibold text-dusty-mauve-900">{item.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-dusty-mauve-600">
                  <span className="rounded-full bg-dry-sage-100 px-3 py-1 text-dry-sage-700">
                    {statusLabels[item.status] || 'Неизвестно'}
                  </span>
                  <span className="text-dusty-mauve-800">
                    {priceFormatter.format(Math.round(item.nightly_rate_cents / 100))}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-dusty-mauve-600">
                  <span>{item.guests_limit} гостей</span>
                  <span>{item.bedrooms} спальни</span>
                  <span>{item.bathrooms} ванные</span>
                </div>
                <div className="mt-auto flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => withViewTransition(() => onNavigate(`/host/listings/${item.id}/edit`))}
                    className="rounded-2xl border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-300"
                  >
                    Редактировать
                  </button>
                  {item.status === 'published' ? (
                    <button
                      type="button"
                      onClick={() => handleUnpublish(item.id)}
                      disabled={actionLoading === item.id}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 disabled:opacity-60"
                    >
                      {actionLoading === item.id ? 'Снимаем...' : 'Снять с публикации'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePublish(item.id)}
                      disabled={actionLoading === item.id}
                      className="rounded-2xl bg-dusty-mauve-900 px-4 py-2 text-xs font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800 disabled:opacity-60"
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
