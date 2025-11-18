import { useCallback, useEffect, useState } from 'react'
import { CatalogPage } from './pages/CatalogPage'
import { LandingPage } from './pages/LandingPage'
import { withViewTransition } from './lib/viewTransitions'

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

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute())

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

  if (route.pathname.startsWith('/catalog')) {
    return <CatalogPage route={route} onNavigate={navigate} />
  }

  return <LandingPage onNavigate={navigate} />
}

export default App
