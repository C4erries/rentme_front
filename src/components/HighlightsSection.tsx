const highlights = [
  {
    title: 'Каталог объявлений',
    copy: 'Собираем квартиры и дома от сотен хостов, проверяем адреса, фото и календарь перед публикацией.',
    accent: 'from-cream-50 to-dry-sage-50',
    link: 'Открыть каталог',
  },
  {
    title: 'Цифровое бронирование',
    copy: 'Запрос просмотра, бронь, предоплата и договор — всё проходит онлайн без скрытых условий.',
    accent: 'from-khaki-beige-50 to-dusty-mauve-50',
    link: 'Как проходит сделка',
  },
  {
    title: 'Инструменты для хостов',
    copy: 'Личный кабинет с календарём, аналитикой спроса и гибкой ценой помогает заполнять даты быстрее.',
    accent: 'from-dusty-mauve-800/90 to-dusty-mauve-700/90 text-dusty-mauve-50',
    link: 'Подключить жильё',
  },
]

export function HighlightsSection() {
  return (
    <section className="container space-y-6 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase text-dry-sage-600">возможности платформы</p>
        <h2 className="text-2xl font-semibold text-dusty-mauve-900 sm:text-3xl">
          Подходит для поездок на любой срок
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className={`rounded-3xl border border-dusty-mauve-100 bg-gradient-to-br p-5 shadow-sm ${item.accent}`}
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm text-dusty-mauve-600">{item.copy}</p>
            <button className="mt-6 text-sm font-semibold text-dry-sage-600 underline underline-offset-4">
              {item.link}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
