import { useEffect, useMemo, useState } from 'react'
import { Header } from '../../components/Header'
import { StateCard } from '../../components/StateCard'
import { getAdminUsers } from '../../lib/adminApi'
import { createDirectConversation } from '../../lib/chatApi'
import { withViewTransition } from '../../lib/viewTransitions'
import type { UserProfile } from '../../types/user'

interface AdminUsersPageProps {
  onNavigate: (path: string, options?: { replace?: boolean }) => void
}

const DEFAULT_LIMIT = 50

export function AdminUsersPage({ onNavigate }: AdminUsersPageProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatTarget, setChatTarget] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(handle)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getAdminUsers({ query: debouncedSearch || undefined, limit: DEFAULT_LIMIT, offset: 0 }, { signal: controller.signal })
      .then((response) => {
        setUsers(response.data.items || [])
        setTotal(response.data.total ?? response.data.items.length)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError((err as Error).message || 'Не удалось загрузить пользователей')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [debouncedSearch, reloadToken])

  const subtitle = useMemo(() => {
    if (debouncedSearch) {
      return `Поиск по запросу «${debouncedSearch}»`
    }
    return 'Обзор пользователей и быстрый старт диалога'
  }, [debouncedSearch])

  const handleWrite = async (user: UserProfile) => {
    setChatTarget(user.id)
    setError(null)
    try {
      const { data } = await createDirectConversation(user.id)
      const target = `/me/chats/${data.id}`
      withViewTransition(() => onNavigate(target))
    } catch (err) {
      setError((err as Error).message || 'Не удалось создать чат')
    } finally {
      setChatTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Админ · пользователи</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Список пользователей</h1>
            <p className="text-sm text-dusty-mauve-500">{subtitle}</p>
          </div>
          <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-dusty-mauve-900 shadow-soft">
            Всего: {total}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-soft sm:flex-row sm:items-center">
          <label className="flex w-full items-center gap-3 rounded-2xl border border-dusty-mauve-100 bg-dusty-mauve-50/60 px-4 py-2 text-sm text-dusty-mauve-700 focus-within:border-dry-sage-400">
            <span className="text-xs uppercase text-dry-sage-500">Поиск</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="email или имя"
              className="w-full bg-transparent outline-none placeholder:text-dusty-mauve-300"
            />
          </label>
          <div className="text-sm text-dusty-mauve-500">{loading ? 'Загрузка...' : `${users.length} записей`}</div>
        </div>

        {error && !loading && (
          <div className="mt-4">
            <StateCard
              variant="error"
              title="Не удалось загрузить пользователей"
              description={error}
              actionLabel="Повторить"
              onAction={() => setReloadToken((token) => token + 1)}
            />
          </div>
        )}
        {loading && (
          <div className="mt-4">
            <StateCard
              variant="loading"
              title="Загружаем пользователей"
              description="Проверяем актуальные роли и статусы."
            />
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-soft">
          <div className="hidden grid-cols-5 bg-dusty-mauve-50/70 px-6 py-3 text-sm font-semibold text-dusty-mauve-700 sm:grid">
            <span>Email</span>
            <span>Имя</span>
            <span>Роли</span>
            <span>Создан</span>
            <span className="text-right">Действия</span>
          </div>
          <div className="divide-y divide-dusty-mauve-100">
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm text-dusty-mauve-900 sm:grid-cols-5 sm:items-center sm:px-6">
                <div>
                  <p className="font-semibold">{user.email}</p>
                  <p className="text-xs text-dusty-mauve-500">ID: {user.id}</p>
                </div>
                <div className="font-medium">{user.name}</div>
                <div className="flex flex-wrap gap-2">
                  {user.roles?.map((role) => (
                    <span key={role} className="rounded-full bg-dry-sage-100 px-3 py-1 text-xs font-semibold uppercase text-dry-sage-700">
                      {role}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-dusty-mauve-600">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')} <br className="sm:hidden" />
                  <span className="text-dusty-mauve-400">{new Date(user.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleWrite(user)}
                    disabled={chatTarget === user.id}
                    className="inline-flex items-center gap-2 rounded-full bg-dusty-mauve-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
                  >
                    {chatTarget === user.id ? 'Открываю...' : 'Написать'}
                  </button>
                </div>
              </div>
            ))}
            {!loading && users.length === 0 && (
              <div className="px-6 py-8">
                <StateCard
                  variant="empty"
                  title="Пользователи не найдены"
                  description="Попробуйте изменить запрос или очистить фильтр."
                  actionLabel="Сбросить поиск"
                  onAction={() => setSearch('')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
