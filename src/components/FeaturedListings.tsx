import { useFeaturedListings } from '../hooks/useFeaturedListings'
import type { Listing } from '../types/listing'

const moodStyles = {
  calm: 'from-dusty-mauve-50 to-khaki-beige-50',
  energetic: 'from-cream-50 to-dry-sage-50',
  heritage: 'from-khaki-beige-100 to-dusty-mauve-50',
} as const

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="grid gap-4 rounded-3xl border border-dusty-mauve-100 bg-gradient-to-b p-4 shadow-sm sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dusty-mauve-500">
          <span className="rounded-full bg-white/70 px-3 py-1 text-dusty-mauve-600">{listing.location}</span>
          {listing.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/50 px-3 py-1 text-dusty-mauve-500">
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-dusty-mauve-900">{listing.title}</h3>
          <p className="text-sm text-dusty-mauve-500">{listing.area}</p>
        </div>

        <dl className="flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-dusty-mauve-500">Стоимость</dt>
            <dd className="text-lg font-semibold text-dusty-mauve-900">{listing.price}</dd>
          </div>
          <div>
            <dt className="text-dusty-mauve-500">Статус</dt>
            <dd className="font-semibold text-dusty-mauve-900">{listing.availableFrom}</dd>
          </div>
        </dl>

        <ul className="space-y-2 text-sm text-dusty-mauve-600">
          {listing.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dry-sage-500" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <button className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-dusty-mauve-800 transition hover:border-dry-sage-400 hover:text-dry-sage-700">
            Запросить приватный тур
          </button>
          <button className="rounded-full border border-transparent px-4 py-2 text-dry-sage-700 underline underline-offset-4">
            Скачать досье дома
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="h-52 w-full object-cover sm:h-full"
            loading="lazy"
          />
        </div>
        <p className="text-xs uppercase text-dusty-mauve-500">
          Код подбора · <span className="font-mono">{listing.id}</span>
        </p>
      </div>
    </article>
  )
}

export function FeaturedListings() {
  const { listings, loading, sourceHint, error } = useFeaturedListings()

  return (
    <section className="container space-y-6 py-8" id="featured">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-dry-sage-600">витрина недели</p>
          <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
            Квартиры, готовые принять вас в ближайшие две недели
          </h2>
        </div>
        {sourceHint && <p className="text-xs text-dusty-mauve-500">{sourceHint}</p>}
      </div>

      {error && (
        <div className="rounded-2xl border border-cream-200 bg-cream-50/70 p-4 text-sm text-dusty-mauve-700">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-64 animate-pulse rounded-3xl border border-dusty-mauve-100 bg-dusty-mauve-100/40"
              />
            ))
          : listings.length > 0
            ? listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-gradient-to-br ${moodStyles[listing.mood]} rounded-3xl`}
                >
                  <ListingCard listing={listing} />
                </div>
              ))
            : (
                <div className="rounded-3xl border border-dusty-mauve-100 bg-white/70 p-6 text-sm text-dusty-mauve-600">
                  В каталоге нет активных квартир. Мы обновляем подборку и вернём её в ближайшее время.
                </div>
              )}
      </div>
    </section>
  )
}
