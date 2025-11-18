import { useEffect } from 'react'
import { useListingOverview } from '../hooks/useListingOverview'
import type { Listing } from '../types/listing'

interface ListingPreviewProps {
  listingId: string | null
  summary: Listing | null
  onClose: () => void
}

const availabilityFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
})

export function ListingPreview({ listingId, summary, onClose }: ListingPreviewProps) {
  const { data, loading, error } = useListingOverview(listingId)

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

  const amenities = (data?.amenities?.length ? data.amenities : summary?.features) ?? []
  const chips = [
    summary?.price,
    summary?.area,
    data?.guests_limit ? `${data.guests_limit} гостей` : null,
    data?.min_nights && data?.max_nights
      ? `${data.min_nights}–${data.max_nights} ночей`
      : null,
  ].filter(Boolean) as string[]

  const title = data?.title ?? summary?.title ?? 'Подборка Rentme'
  const location =
    (data?.address?.line1
      ? [data.address.line1, data.address.city].filter(Boolean).join(' · ')
      : summary?.location) ?? 'Локация уточняется'
  const description =
    data?.description ??
    'Собираем расширенное описание, проверяем историю дома и готовим чек-лист для просмотра.'

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
              <p className="text-xs uppercase text-dry-sage-600">подробности жилья</p>
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

            <div className="space-y-2">
              <p className="text-xs uppercase text-dry-sage-600">сервисы и удобства</p>
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
                    <span className="text-sm text-dusty-mauve-500">
                      Ждём подтверждения списка удобств от хозяина.
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-dusty-mauve-100 bg-white/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase text-dry-sage-600">доступность</p>
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
                <p className="text-sm text-dusty-mauve-600">
                  Свободно в указанный период — можно бронировать после просмотра.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-cream-200 bg-cream-50/70 p-3 text-sm text-dusty-mauve-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:care@rentme.app?subject=Rentme%20Club%20-%20${listingId}`}
                className="inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
              >
                Запросить просмотр
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
          </div>

          {summary?.thumbnail && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-3xl">
                <img
                  src={summary.thumbnail}
                  alt={summary.title}
                  className="h-60 w-full object-cover sm:h-full"
                />
              </div>
              <p className="text-xs uppercase text-dusty-mauve-500">
                Код подбора · <span className="font-mono">{summary.id}</span>
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
