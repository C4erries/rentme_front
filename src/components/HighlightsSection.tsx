const highlights = [
  {
    title: 'Личный куратор и консьерж',
    copy: 'Куратор ведёт переписку с владельцем, согласует графики просмотра, а консьерж подключает клининг и сервисы после переезда.',
    accent: 'from-cream-50 to-dry-sage-50',
    link: 'Познакомиться с командой',
  },
  {
    title: 'Юридический и финансовый щит',
    copy: 'Проверяем право собственности, историю ЖК и коммунальных платежей. Подготовим договор и чек-лист приёма квартиры.',
    accent: 'from-khaki-beige-50 to-dusty-mauve-50',
    link: 'Скачать чек-лист проверки',
  },
  {
    title: 'Район под ваш стиль жизни',
    copy: 'Гид по кофейням, маршрутам, школам и спорту. Доступен прямо в приложении в момент, когда вы просматриваете квартиру.',
    accent: 'from-dusty-mauve-800/90 to-dusty-mauve-700/90 text-dusty-mauve-50',
    link: 'Посмотреть пример гида',
  },
]

export function HighlightsSection() {
  return (
    <section className="container space-y-6 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase text-dry-sage-600">сервисы клуба</p>
        <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
          Поддерживаем на каждом этапе переезда
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className={`rounded-3xl border border-dusty-mauve-100 bg-gradient-to-br p-5 shadow-sm ${item.accent}`}
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm text-dusty-mauve-600">
              {item.copy}
            </p>
            <button className="mt-6 text-sm font-semibold text-dry-sage-600 underline underline-offset-4">
              {item.link}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
