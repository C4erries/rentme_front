import { useFeaturedListings } from '../hooks/useFeaturedListings'
import type { Listing } from '../types/listing'

const moodStyles = {
  calm: 'from-dusty-mauve-50 to-khaki-beige-50',
  energetic: 'from-cream-50 to-dry-sage-50',
  heritage: 'from-khaki-beige-100 to-dusty-mauve-50',
} as const

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="grid gap-4 rounded-3xl border border-dusty-mauve-100 bg-gradient-to-b p-4 shadow-sm sm:grid-cols-[1.3fr_1fr] sm:p-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {listing.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-dusty-mauve-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-dusty-mauve-900">{listing.title}</h3>
          <p className="text-sm text-dusty-mauve-500">{listing.location}</p>
        </div>

        <dl className="flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-dusty-mauve-500">Стоимость</dt>
            <dd className="font-semibold text-dusty-mauve-900">{listing.price}</dd>
          </div>
          <div>
            <dt className="text-dusty-mauve-500">Площадь</dt>
            <dd className="font-semibold text-dusty-mauve-900">{listing.area}</dd>
          </div>
          <div>
            <dt className="text-dusty-mauve-500">Доступно</dt>
            <dd className="font-semibold text-dusty-mauve-900">{listing.availableFrom}</dd>
          </div>
        </dl>

        <ul className="grid gap-2 text-sm text-dusty-mauve-600">
          {listing.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dry-sage-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="h-48 w-full object-cover sm:h-full"
            loading="lazy"
          />
        </div>
        <button className="w-full rounded-2xl border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-800 transition hover:border-dry-sage-400 hover:text-dry-sage-700">
          Записаться на просмотр
        </button>
      </div>
    </article>
  )
}

export function FeaturedListings() {
  const { listings, loading, error, endpoint } = useFeaturedListings()

  const shimmer = (
    <div className="h-64 animate-pulse rounded-3xl border border-dusty-mauve-100 bg-dusty-mauve-100/40" />
  )

  return (
    <section className="container space-y-6 py-6 md:py-10" id="featured">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-dry-sage-600">подбор от кураторской</p>
          <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
            Мини-коллекция домов, готовых к заселению
          </h2>
        </div>
        {endpoint && (
          <p className="text-xs text-dusty-mauve-500">
            источник · <span className="font-mono">{endpoint}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-cream-200 bg-cream-50/60 p-4 text-sm text-dusty-mauve-700">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {loading
          ? [shimmer, shimmer]
          : listings.map((listing) => (
              <div
                key={listing.id}
                className={`bg-gradient-to-br ${moodStyles[listing.mood]} rounded-3xl`}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
      </div>
    </section>
  )
}
