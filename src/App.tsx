import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { CatalogPage } from './pages/CatalogPage'
import { LandingPage } from './pages/LandingPage'
import { HostListingsPage } from './pages/host/HostListingsPage'
import { HostListingWizardPage } from './pages/host/HostListingWizardPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { GuestBookingsPage } from './pages/me/GuestBookingsPage'
import { ChatListPage } from './pages/me/ChatListPage'
import { ChatThreadPage } from './pages/me/ChatThreadPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminMetricsPage } from './pages/admin/AdminMetricsPage'
import { useChatList } from './hooks/useChatList'
import { withViewTransition } from './lib/viewTransitions'
import { useAuth } from './context/AuthContext'
import { ChatBadgeProvider } from './context/ChatBadgeContext'
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
  const chatState = useChatList({ enabled: isAuthenticated, intervalMs: 8000 })
  const isAdmin = Boolean(user?.roles?.includes('admin'))
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
  const wrapWithChatBadge = (element: ReactElement) => (
    <ChatBadgeProvider value={chatState.hasUnread}>{element}</ChatBadgeProvider>
  )
  if (isLoading) {
    return wrapWithChatBadge(<CenteredMessage message="ГђВ—ГђВ°ГђВіГ‘ВЂГ‘ВѓГђВ¶ГђВ°ГђВµГђВј ГђВІГђВ°Г‘В€ ГђВїГ‘ВЂГђВѕГ‘В„ГђВёГђВ»Г‘ВЊ..." />)
  }
  if (pathname === '/login') {
    return wrapWithChatBadge(<LoginPage onNavigate={navigate} redirectTo={redirectTarget} />)
  }
  if (pathname === '/register') {
    return wrapWithChatBadge(<RegisterPage onNavigate={navigate} />)
  }
  const chatMatch = pathname.match(/^\/me\/chats\/([^/]+)$/)
  if (chatMatch) {
    return renderProtected(
      <ChatThreadPage conversationId={chatMatch[1]} onNavigate={navigate} refreshChats={chatState.refresh} />,
    )
  }
  if (pathname === '/me/chats') {
    return renderProtected(
      <ChatListPage
        onNavigate={navigate}
        chatState={{
          data: chatState.data,
          loading: chatState.loading,
          error: chatState.error,
          refresh: chatState.refresh,
          hasUnread: chatState.hasUnread,
        }}
      />,
    )
  }
  if (pathname.startsWith('/me')) {
    return renderProtected(<GuestBookingsPage onNavigate={navigate} />)
  }
  if (pathname.startsWith('/catalog')) {
    return wrapWithChatBadge(<CatalogPage route={route} onNavigate={navigate} />)
  }
  if (pathname === '/admin/users') {
    return renderProtected(<AdminUsersPage onNavigate={navigate} />, { requireAdmin: true })
  }
  if (pathname === '/admin/ml' || pathname === '/admin/metrics') {
    return renderProtected(<AdminMetricsPage onNavigate={navigate} />, { requireAdmin: true })
  }
  if (pathname === '/host/listings') {
    return renderProtected(<HostListingsPage onNavigate={navigate} />, { requireHost: true })
  }
  if (isHostWizardPath(pathname)) {
    return renderProtected(<HostListingWizardPage route={route} onNavigate={navigate} />, { requireHost: true })
  }
  if (pathname === '/how-it-works') {
    return wrapWithChatBadge(<LandingPage onNavigate={navigate} focusSection="how-it-works" />)
  }
  if (pathname === '/stories') {
    return wrapWithChatBadge(<LandingPage onNavigate={navigate} focusSection="stories" />)
  }
  return wrapWithChatBadge(<LandingPage onNavigate={navigate} />)
  function renderProtected(element: ReactElement, options: { requireHost?: boolean; requireAdmin?: boolean } = {}) {
    if (!isAuthenticated) {
      const target = `/login?redirect=${encodeURIComponent(pathname + route.search)}`
      return wrapWithChatBadge(
        <RedirectingScreen message="Перенаправляем на вход..." target={target} onNavigate={navigate} />,
      )
    }
    if (options.requireAdmin && !isAdmin) {
      return wrapWithChatBadge(
        <CenteredMessage
          message="Доступ к этой странице есть только у администраторов."
          actionLabel="На главную"
          onAction={() => navigate('/')}
        />,
      )
    }
    if (options.requireHost && !user?.roles?.includes('host')) {
      return wrapWithChatBadge(
        <CenteredMessage
          message="Для доступа к кабинетам хоста нужна роль host. Оставьте заявку в поддержке или добавьте роль в профиле."
          actionLabel="Вернуться на главную"
          onAction={() => navigate('/')}
        />,
      )
    }
    return wrapWithChatBadge(element)
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
