const spotlights = [
  {
    district: 'Хамовники',
    vibe: 'slow living',
    summary:
      'Маршруты вдоль Москвы-реки, рестораны у набережной и элитные школы в шаге. Показываем реальные уровни шума и света в течение суток.',
    tips: ['пешие 7 минут до парка МУЗЕОН', 'закрытые дворы без машин'],
  },
  {
    district: 'Новая Голландия',
    vibe: 'creative scene',
    summary:
      'Лофты с кирпичными сводами, галереи во двориках и гастрономия вечернего типа. Публикуем расписание событий прямо в подборке.',
    tips: ['уличные рынки по выходным', 'отдельные парковки для велосипедов'],
  },
  {
    district: 'Сити-парк',
    vibe: 'family mix',
    summary:
      'Современные кварталы с велодорожками, детскими павильонами и сервисами для домашних питомцев. Идеален для семейного контракта на 2+ года.',
    tips: ['частные сады и кружки', 'маршруты доставки фермерских продуктов'],
  },
]

export function NeighborhoodStories() {
  return (
    <section id="stories" className="container space-y-6 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-dry-sage-600">районы и истории</p>
          <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
            Подбираем не только дом, но и привычки вокруг него
          </h2>
        </div>
        <p className="text-sm text-dusty-mauve-500">
          Редакция Rentme обновляет гайды новыми аудио- и видео-маркерами каждую неделю.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {spotlights.map((place) => (
          <article
            key={place.district}
            className="flex flex-col gap-4 rounded-3xl border border-dusty-mauve-100 bg-white/80 p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-semibold text-dusty-mauve-900">{place.district}</h3>
              <span className="rounded-full bg-dry-sage-100 px-3 py-1 text-xs font-semibold text-dry-sage-700 uppercase">
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
              Получить гайд района
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
