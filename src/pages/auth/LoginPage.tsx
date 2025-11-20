import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Header } from '../../components/Header'
import { withViewTransition } from '../../lib/viewTransitions'

interface LoginPageProps {
  onNavigate: (path: string, options?: { replace?: boolean }) => void
  redirectTo?: string
}

export function LoginPage({ onNavigate, redirectTo }: LoginPageProps) {
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      withViewTransition(() => onNavigate(redirectTo || '/me/bookings', { replace: true }))
    }
  }, [isAuthenticated, redirectTo, onNavigate])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) {
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      withViewTransition(() => onNavigate(redirectTo || '/me/bookings', { replace: true }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container flex justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-dry-sage-400">Вход</p>
          <h1 className="mt-1 text-3xl font-semibold text-dusty-mauve-900">С возвращением</h1>
          <p className="mt-2 text-sm text-dusty-mauve-500">Введите почту и пароль от аккаунта Rentme.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="text-sm font-medium text-dusty-mauve-800">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-dusty-mauve-200 bg-white/80 px-4 py-3 text-dusty-mauve-900 focus:border-dry-sage-400 focus:outline-none"
                placeholder="you@example.com"
              />
            </label>
            <label className="text-sm font-medium text-dusty-mauve-800">
              Пароль
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-dusty-mauve-200 bg-white/80 px-4 py-3 text-dusty-mauve-900 focus:border-dry-sage-400 focus:outline-none"
                placeholder="••••••••"
              />
            </label>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-dusty-mauve-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-70"
            >
              {submitting ? 'Входим...' : 'Войти'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-dusty-mauve-500">
            Нет аккаунта?{' '}
            <button
              type="button"
              className="font-semibold text-dry-sage-700 hover:underline"
              onClick={() => withViewTransition(() => onNavigate('/register'))}
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
