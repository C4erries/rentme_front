const testimonials = [
  {
    name: 'Саша и Полина',
    role: 'основатели студии Sense',
    quote:
      'Куратор Rentme нашёл нам двухуровневый лофт в Питере и выбил месяц на переезд. Все согласования были в приложении.',
    avatar: 'SP',
  },
  {
    name: 'Егор',
    role: 'продакт в health-tech',
    quote:
      'Понравилась честная аналитика по домам — видно реальные расходы, соседей и какие очереди на подписания договора.',
    avatar: 'EG',
  },
  {
    name: 'Марина',
    role: 'архитектор',
    quote:
      'Команда помогла собрать жизнь в новом городе: подключили cleaning, нашли сад для ребёнка и продлили страховку.',
    avatar: 'MR',
  },
]

export function TestimonialsSection() {
  return (
    <section className="container space-y-6 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase text-dry-sage-600">обратная связь</p>
        <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
          Люди переезжают с нами осознанно
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <figure
            key={item.name}
            className="rounded-3xl border border-dusty-mauve-100 bg-white/80 p-5 text-sm text-dusty-mauve-600"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dusty-mauve-900 text-sm font-semibold text-dusty-mauve-50">
                {item.avatar}
              </div>
              <div>
                <figcaption className="font-semibold text-dusty-mauve-900">{item.name}</figcaption>
                <p className="text-xs text-dusty-mauve-500">{item.role}</p>
              </div>
            </div>
            <blockquote className="mt-4 text-base text-dusty-mauve-700">{item.quote}</blockquote>
          </figure>
        ))}
      </div>
    </section>
  )
}
