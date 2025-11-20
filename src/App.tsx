import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { CatalogPage } from './pages/CatalogPage'
import { LandingPage } from './pages/LandingPage'
import { HostListingsPage } from './pages/host/HostListingsPage'
import { HostListingWizardPage } from './pages/host/HostListingWizardPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { GuestBookingsPage } from './pages/me/GuestBookingsPage'
import { withViewTransition } from './lib/viewTransitions'
import { useAuth } from './context/AuthContext'

interface AppRoute {
  pathname: string
  search: string
}

function getCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return { pathname: '/', search: '' }
  }
  return { pathname: window.location.pathname, search: window.location.search }
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed.length === 0 ? '/' : trimmed
}

function isHostWizardPath(pathname: string): boolean {
  if (pathname === '/host/listings/new') {
    return true
  }
  return /^\/host\/listings\/[^/]+\/edit$/.test(pathname)
}

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute())
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') {
      return
    }
    withViewTransition(() => {
      const method: 'pushState' | 'replaceState' = options?.replace ? 'replaceState' : 'pushState'
      window.history[method](null, '', path)
      setRoute(getCurrentRoute())
    })
  }, [])

  const pathname = normalizePathname(route.pathname)
  const redirectTarget = useMemo(() => new URLSearchParams(route.search).get('redirect') ?? undefined, [route.search])

  if (isLoading) {
    return <CenteredMessage message="Загружаем ваш профиль..." />
  }

  if (pathname === '/login') {
    return <LoginPage onNavigate={navigate} redirectTo={redirectTarget} />
  }

  if (pathname === '/register') {
    return <RegisterPage onNavigate={navigate} />
  }

  if (pathname.startsWith('/me')) {
    return renderProtected(<GuestBookingsPage onNavigate={navigate} />)
  }

  if (pathname.startsWith('/catalog')) {
    return <CatalogPage route={route} onNavigate={navigate} />
  }

  if (pathname === '/host/listings') {
    return renderProtected(<HostListingsPage onNavigate={navigate} />, { requireHost: true })
  }

  if (isHostWizardPath(pathname)) {
    return renderProtected(<HostListingWizardPage route={route} onNavigate={navigate} />, { requireHost: true })
  }

  return <LandingPage onNavigate={navigate} />

  function renderProtected(element: ReactElement, options: { requireHost?: boolean } = {}) {
    if (!isAuthenticated) {
      const target = `/login?redirect=${encodeURIComponent(pathname + route.search)}`
      return <RedirectingScreen message="Перенаправляем на вход..." target={target} onNavigate={navigate} />
    }
    if (options.requireHost && !user?.roles?.includes('host')) {
      return (
        <CenteredMessage
          message="Для доступа к кабинетам хоста нужна роль «host». Оставьте заявку в поддержке или добавьте роль в профиле."
          actionLabel="Вернуться на главную"
          onAction={() => navigate('/')}
        />
      )
    }
    return element
  }
}

export default App

function RedirectingScreen({
  target,
  message,
  onNavigate,
}: {
  target: string
  message: string
  onNavigate: (path: string, options?: { replace?: boolean }) => void
}) {
  useEffect(() => {
    withViewTransition(() => onNavigate(target, { replace: true }))
  }, [target, onNavigate])
  return <CenteredMessage message={message} />
}

function CenteredMessage({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dusty-mauve-50 px-6 text-center">
      <p className="text-lg text-dusty-mauve-700">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
