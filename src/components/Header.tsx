import { useState } from 'react'
import type { MouseEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { withViewTransition } from '../lib/viewTransitions'
import { useChatBadge } from '../context/ChatBadgeContext'

interface HeaderProps {
  onNavigate?: (path: string, options?: { replace?: boolean }) => void
  hasUnreadChats?: boolean
}

const navLinks = [
  { label: 'Каталог', hint: 'Жильё для поездок и жизни', href: '/catalog' },
  { label: 'Как это работает', hint: 'Понятные шаги бронирования', href: '/how-it-works' },
  { label: 'Истории гостей', hint: 'Реальные маршруты и районы', href: '/stories' },
]

export function Header({ onNavigate, hasUnreadChats }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const isHost = Boolean(user?.roles?.includes('host'))
  const isAdmin = Boolean(user?.roles?.includes('admin'))
  const unreadChats = typeof hasUnreadChats === 'boolean' ? hasUnreadChats : useChatBadge()
  const unreadDotClass = unreadChats ? 'bg-red-500 shadow-[0_0_0_4px_rgba(248,113,113,0.35)]' : 'bg-dry-sage-500'

  const handleLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) {
      event.preventDefault()
      navigate(href)
    }
  }

  const navigate = (path: string, options?: { replace?: boolean }) => {
    closeMenus()
    if (onNavigate) {
      withViewTransition(() => onNavigate(path, options))
    }
  }

  const handleLogout = async () => {
    closeMenus()
    await logout()
    if (onNavigate) {
      withViewTransition(() => onNavigate('/', { replace: true }))
    }
  }

  const closeMenus = () => {
    setMenuOpen(false)
    setAccountMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-dusty-mauve-50/70 shadow-[0_10px_40px_rgba(27,24,26,0.1)] backdrop-blur-2xl">
      <div className="container py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a
            href="/"
            onClick={(event) => handleLink(event, '/')}
            className="flex items-center gap-3 rounded-full border border-transparent px-2 py-1 transition hover:border-dry-sage-200"
          >
            <span className="text-xl font-semibold uppercase tracking-tight text-dusty-mauve-900">Rentme</span>
            <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold text-dry-sage-700 shadow-soft sm:flex">
              <span>Маркетплейс</span>
              <span className="text-dusty-mauve-500">для долгой и короткой аренды</span>
            </div>
          </a>

          <div
            className={`flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-soft transition-all md:flex-row md:items-center md:justify-between md:gap-6 md:border-transparent md:bg-transparent md:p-0 md:shadow-none ${
              menuOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
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

            <div className="flex flex-col gap-3 text-sm font-semibold md:flex-row md:items-center">
              <button
                type="button"
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center justify-center rounded-full border border-dusty-mauve-200 px-5 py-2 text-dusty-mauve-900 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
              >
                Найти жильё
              </button>
              <button
                type="button"
                onClick={() => navigate('/host/listings/new')}
                className="inline-flex items-center justify-center rounded-full bg-dusty-mauve-900 px-5 py-2 text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
              >
                Разместить объявление
              </button>
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-dusty-mauve-200 px-5 py-2 text-dusty-mauve-900 hover:border-dry-sage-400"
                  >
                    <span className={`h-2 w-2 rounded-full ${unreadDotClass}`} />
                    {user?.name || 'Профиль'}
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 z-20 mt-3 w-56 rounded-2xl border border-white/60 bg-white/95 p-3 text-sm text-dusty-mauve-800 shadow-soft">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-dusty-mauve-50"
                        onClick={() => navigate('/me/chats')}
                      >
                        Сообщения
                        {unreadChats && <span className="h-2 w-2 rounded-full bg-red-500" />}
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-dusty-mauve-50"
                        onClick={() => navigate('/me/bookings')}
                      >
                        Мои поездки
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-dusty-mauve-50"
                          onClick={() => navigate('/admin/users')}
                        >
                          Админка
                        </button>
                      )}
                      {isHost && (
                        <button
                          type="button"
                          className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-dusty-mauve-50"
                          onClick={() => navigate('/host/listings')}
                        >
                          Кабинет хоста
                        </button>
                      )}
                      <button
                        type="button"
                        className="mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-dusty-mauve-900 transition hover:border-dry-sage-400"
                  >
                    Войти
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="rounded-full bg-dry-sage-600 px-5 py-2 text-white transition hover:bg-dry-sage-500"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold text-dusty-mauve-900 shadow-sm"
            >
              Каталог
            </button>
            <button
              type="button"
              onClick={() => navigate('/host/listings/new')}
              className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Разместить
            </button>
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
