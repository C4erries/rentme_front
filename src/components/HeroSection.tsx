const stats = [
  { label: 'Сделок в 2024', value: '312', note: 'без комиссий и сюрпризов' },
  { label: 'Средний подбор', value: '8 дней', note: 'от брифа до ключей' },
  { label: 'Проверенные дома', value: '54', note: 'с сервисами уровня отеля' },
] as const

const highlights = ['консьерж 24/7', 'юридический щит', 'цифровая сделка', 'guides по районам']

const conciergeContacts = [
  { label: 'Телефон', value: '+7 495 123‑44‑88', href: 'tel:+74951234488' },
  { label: 'Telegram', value: '@rentme_care', href: 'https://t.me/rentme' },
  { label: 'Mail', value: 'hello@rentme.app', href: 'mailto:hello@rentme.app' },
]

const viewingCard = {
  slot: 'Среда, 18:40',
  address: 'Остоженка · клубный дом “Buran”',
  mood: 'двухуровневый лофт · 118 м²',
}

const serviceSteps = [
  'Снимаем бриф и подбираем 3–5 квартир в приложении',
  'Проверяем историю собственника и ЖК',
  'Организуем показы и цифровое подписание договора',
]

export function HeroSection() {
  return (
    <section className="container grid gap-8 py-10 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-dry-sage-200 bg-dry-sage-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-dry-sage-700">
          club service · городские аренды без стресса
        </span>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-dusty-mauve-900 sm:text-4xl lg:text-5xl">
            Подбираем квартиры с сервисом отеля и поддержкой личного куратора
          </h1>
          <p className="text-base text-dusty-mauve-600 sm:text-lg">
            Rentme берёт на себя бриф, переговоры и проверку юридических рисков. Вы получаете
            подборку домов под свой ритм и переезжаете без комиссий и спешки.
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
            <p className="text-sm uppercase text-dry-sage-600">Контакт куратора</p>
            <p className="text-base font-semibold text-dusty-mauve-900">
              Вера · руководитель клиентского сервиса
            </p>
            <p className="text-sm text-dusty-mauve-600">ответит на запрос в течение 10 минут</p>
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
