const highlights = [
  {
    title: 'Полевые гиды по районам',
    copy: 'Живые карты с инфраструктурой, шумом трафика и маршрутами в течение суток.',
    accent: 'morning',
  },
  {
    title: 'Юридический щит',
    copy: 'Проверяем право собственности и готовим договор в приложении, без поездок.',
    accent: 'noon',
  },
  {
    title: 'Сервис заботы после въезда',
    copy: 'Консьерж решит вопрос с клинингом, мелким ремонтом и переговорами с управляющей.',
    accent: 'night',
  },
]

const accentMap: Record<string, string> = {
  morning: 'from-cream-50 to-dry-sage-50',
  noon: 'from-khaki-beige-50 to-dusty-mauve-50',
  night: 'from-dusty-mauve-800/90 to-dusty-mauve-700/90 text-dusty-mauve-50',
}

export function HighlightsSection() {
  return (
    <section className="container space-y-6 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase text-dry-sage-600">больше чем поиск</p>
        <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
          Адаптируемся под ваш стиль жизни
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className={`rounded-3xl border border-dusty-mauve-100 bg-gradient-to-br p-5 shadow-sm ${accentMap[item.accent]}`}
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-dusty-mauve-600">
              {item.copy}
            </p>
            <button className="mt-6 text-sm font-semibold text-dry-sage-600 underline underline-offset-4">
              Узнать детали
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
