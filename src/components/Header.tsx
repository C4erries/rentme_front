import { useState } from 'react'
import type { MouseEvent } from 'react'

interface HeaderProps {
  onNavigate?: (path: string) => void
}

const navLinks = [
  { label: 'Каталог', hint: 'объявления к заселению', href: '/catalog' },
  { label: 'Как это работает', hint: 'поиск → просмотр → бронь', href: '#how-it-works' },
  { label: 'Районы', hint: 'гиды и истории', href: '#stories' },
]

export function Header({ onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) {
      event.preventDefault()
      onNavigate?.(href)
      setMenuOpen(false)
    }
  }

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-4 text-sm md:flex-row md:items-center md:justify-center">
      {navLinks.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={(event) => handleLink(event, item.href)}
          className="group flex flex-col rounded-2xl border border-transparent px-4 py-2 transition hover:border-dry-sage-300 hover:bg-white/40"
        >
          <span className="font-medium text-dusty-mauve-900 group-hover:text-dry-sage-700">{item.label}</span>
          <span className="text-xs text-dusty-mauve-500">{item.hint}</span>
        </a>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-40 bg-dusty-mauve-50/70 shadow-[0_10px_40px_rgba(27,24,26,0.1)] backdrop-blur-2xl">
      <div className="container py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold uppercase tracking-tight text-dusty-mauve-900">Rentme</span>
            <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold text-dry-sage-700 shadow-soft sm:flex">
              <span>Жильё</span>
              <span className="text-dusty-mauve-500">на любой срок</span>
            </div>
          </div>

          <div
            className={`flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-soft transition-all md:flex-row md:items-center md:justify-between md:gap-6 md:border-transparent md:bg-transparent md:p-0 md:shadow-none ${
              menuOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            <NavLinks />
            <div className="flex flex-col gap-3 text-sm font-semibold md:flex-row md:items-center">
              <a
                href="/catalog"
                onClick={(event) => handleLink(event, '/catalog')}
                className="inline-flex items-center justify-center rounded-full border border-dusty-mauve-200 px-5 py-2 text-dusty-mauve-900 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
              >
                Найти жильё
              </a>
              <a
                href="mailto:hosts@rentme.app?subject=Rentme%20-%20Add%20listing"
                className="inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-2 text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
              >
                Разместить жильё
              </a>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 md:hidden">
            <a
              href="/catalog"
              onClick={(event) => handleLink(event, '/catalog')}
              className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold text-dusty-mauve-900 shadow-sm"
            >
              Каталог
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-dusty-mauve-200 bg-white/70"
              aria-label="Открыть меню"
            >
              <span className="sr-only">Меню</span>
              <span className="block h-0.5 w-5 bg-dusty-mauve-900" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

