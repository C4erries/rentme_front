const stats = [
  { label: 'Городов в каталоге', value: '18', note: 'Москва, Петербург, Прага и другие' },
  { label: 'Хостов на платформе', value: '640+', note: 'верифицированы документами' },
  { label: 'Диапазон аренды', value: '3–365 ночей', note: 'кратко и надолго' },
] as const

const highlights = [
  'кратко- и долгосрочные поездки',
  'единый календарь доступности',
  'цифровое бронирование',
  'аналитика цен',
]

const conciergeContacts = [
  { label: 'Чат поддержки', value: '@rentme_support', href: 'https://t.me/rentme' },
  { label: 'Почта', value: 'support@rentme.app', href: 'mailto:support@rentme.app' },
  { label: 'Для хостов', value: 'hosts@rentme.app', href: 'mailto:hosts@rentme.app' },
]

const viewingCard = {
  slot: 'Четверг, 19:00',
  address: 'Каталог · Riverside Loft',
  mood: 'loft · 3 спальни · 122 м²',
}

const serviceSteps = [
  'Выбираете город, дату и формат проживания',
  'Созваниваетесь или чатитесь с хостом через Rentme',
  'Бронируете и подписываете договор онлайн',
]

export function HeroSection() {
  return (
    <section className="container grid gap-8 py-10 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-dry-sage-200 bg-dry-sage-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-dry-sage-700">
          marketplace · жильё от verified хостов
        </span>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-dusty-mauve-900 sm:text-4xl lg:text-5xl">
            Маркетплейс для поиска и бронирования жилья
          </h1>
          <p className="text-base text-dusty-mauve-600 sm:text-lg">
            Rentme соединяет гостей и хостов: публикуем проверенные объявления с календарями,
            показываем честную стоимость и даём бронировать онлайн на нужный срок.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-dusty-mauve-600 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="grid gap-4 rounded-2xl bg-dusty-mauve-900/5 p-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs uppercase text-dusty-mauve-500">{item.label}</p>
              <p className="text-lg font-semibold text-dusty-mauve-900">{item.value}</p>
              <p className="text-xs text-dusty-mauve-500">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="https://t.me/rentme"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
          >
            Написать в Telegram
          </a>
          <a
            href="mailto:care@rentme.app?subject=Rentme%20Club%20бронь"
            className="inline-flex items-center justify-center rounded-full border border-dusty-mauve-200 px-6 py-3 text-sm font-semibold text-dusty-mauve-700 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
          >
            Отправить бриф на почту
          </a>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft">
          <p className="text-xs uppercase text-dusty-mauve-500">Ближайший показ</p>
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-dry-sage-700">{viewingCard.slot}</p>
            <p className="text-lg font-semibold text-dusty-mauve-900">{viewingCard.address}</p>
            <p className="text-sm text-dusty-mauve-500">{viewingCard.mood}</p>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-dusty-mauve-50/70 px-4 py-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dry-sage-200 text-sm font-semibold text-dry-sage-700">
              live
            </span>
            <div>
              <p className="text-sm font-semibold text-dusty-mauve-900">Съёмка тура для клиента</p>
              <p className="text-xs text-dusty-mauve-500">отправим в приложении через 30 минут</p>
            </div>
          </div>
        </div>

        <div className="glass-panel space-y-5 p-5">
          <div>
            <p className="text-sm uppercase text-dry-sage-600">Служба поддержки</p>
            <p className="text-base font-semibold text-dusty-mauve-900">
              Команда поддержки Rentme
            </p>
            <p className="text-sm text-dusty-mauve-600">
              отвечает на запросы хостов и гостей в течение 10 минут
            </p>
          </div>
          <dl className="space-y-2 text-sm text-dusty-mauve-700">
            {conciergeContacts.map((contact) => (
              <div key={contact.label} className="flex items-center justify-between gap-3">
                <dt className="text-dusty-mauve-500">{contact.label}</dt>
                <dd>
                  <a
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="font-semibold text-dusty-mauve-900 hover:text-dry-sage-600"
                  >
                    {contact.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <div className="space-y-2 rounded-2xl border border-dusty-mauve-100/80 bg-white/80 p-4">
            <p className="text-xs uppercase text-dusty-mauve-500">Как мы работаем</p>
            <ul className="space-y-2 text-sm text-dusty-mauve-600">
              {serviceSteps.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-dry-sage-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
