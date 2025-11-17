const spotlights = [
  {
    district: 'Хамовники',
    vibe: 'slow living',
    summary: 'Пешие 8 минут до Москва-реки, кофейни третьей волны и школы в шаговой доступности.',
    tips: ['Однородная архитектура', 'Зелёные маршруты для бега'],
  },
  {
    district: 'Новая Голландия',
    vibe: 'creative scene',
    summary: 'Лофты над каналами, клубные пространства и ежедневные выставки во двориках.',
    tips: ['Живые рынки выходного дня', 'Музыка во внутренних двориках'],
  },
  {
    district: 'Сити-парк',
    vibe: 'family mix',
    summary: 'Закрытые дворы без машин, игровые павильоны и безопасные веломаршруты.',
    tips: ['Маршрут каршеринга', 'Местные фермеры по подписке'],
  },
]

export function NeighborhoodStories() {
  return (
    <section className="container space-y-6 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-dry-sage-600">гид по районам</p>
          <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
            Собрали маршруты и привычки местных
          </h2>
        </div>
        <p className="text-sm text-dusty-mauve-500">
          Каждую неделю обновляем подборки lifestyle-подсказок внутри приложения.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {spotlights.map((place) => (
          <article
            key={place.district}
            className="flex flex-col gap-4 rounded-3xl border border-dusty-mauve-100 bg-white/70 p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-semibold text-dusty-mauve-900">{place.district}</h3>
              <span className="rounded-full bg-dry-sage-100 px-3 py-1 text-xs font-semibold text-dry-sage-700">
                {place.vibe}
              </span>
            </div>
            <p className="text-sm text-dusty-mauve-600">{place.summary}</p>
            <ul className="space-y-2 text-sm text-dusty-mauve-600">
              {place.tips.map((tip) => (
                <li key={tip} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-dusty-mauve-400" />
                  {tip}
                </li>
              ))}
            </ul>
            <button className="text-left text-sm font-semibold text-dusty-mauve-900 underline underline-offset-4">
              Открыть маршрут
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
