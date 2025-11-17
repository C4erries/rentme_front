const navLinks = [
  { label: 'Каталог', hint: '140+ квартир в проверенных домах' },
  { label: 'Консьерж', hint: 'Персональный брокер в Telegram' },
  { label: 'Гиды по районам', hint: 'Авторские маршруты и инфраструктура' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-dusty-mauve-100/80 bg-dusty-mauve-50/90 backdrop-blur-2xl">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-dusty-mauve-900">
            Rentme
          </span>
          <span className="hidden text-xs text-dusty-mauve-500 sm:inline">
            мобильный клуб аренды
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((item) => (
            <div key={item.label} className="group flex flex-col">
              <span className="font-medium text-dusty-mauve-700 group-hover:text-dry-sage-700">
                {item.label}
              </span>
              <span className="text-xs text-dusty-mauve-500">{item.hint}</span>
            </div>
          ))}
        </nav>

        <button className="rounded-full bg-dry-sage-500 px-4 py-2 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dry-sage-600">
          Оставить запрос
        </button>
      </div>
    </header>
  )
}
