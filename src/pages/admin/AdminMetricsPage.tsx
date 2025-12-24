import { useEffect, useState } from 'react'
import { Header } from '../../components/Header'
import { StateCard } from '../../components/StateCard'
import { getMlMetrics } from '../../lib/adminApi'
import { withViewTransition } from '../../lib/viewTransitions'
import type { MlMetrics, ModelMetrics } from '../../types/admin'

interface AdminMetricsPageProps {
  onNavigate: (path: string, options?: { replace?: boolean }) => void
}

export function AdminMetricsPage({ onNavigate }: AdminMetricsPageProps) {
  const [data, setData] = useState<MlMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    getMlMetrics({ signal: controller.signal })
      .then((response) => setData(response.data))
      .catch((err) => {
        if (controller.signal.aborted) return
        setError((err as Error).message || 'Не удалось загрузить метрики')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [reloadToken])

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Админ · ML</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Метрики моделей</h1>
            <p className="text-sm text-dusty-mauve-500">Качество short_term и long_term моделей на тестовых датасетах</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => withViewTransition(() => onNavigate('/admin/users'))}
            className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold uppercase text-dusty-mauve-700 transition hover:border-dry-sage-400"
          >
            Пользователи
          </button>
          <button
            type="button"
            onClick={() => withViewTransition(() => onNavigate('/admin/metrics'))}
            className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-xs font-semibold uppercase text-dusty-mauve-50"
          >
            ML метрики
          </button>
        </div>

        {error && !loading && (
          <div className="mt-4">
            <StateCard
              variant="error"
              title="Метрики недоступны"
              description={error}
              actionLabel="Повторить"
              onAction={() => setReloadToken((token) => token + 1)}
            />
          </div>
        )}
        {loading && (
          <div className="mt-4">
            <StateCard variant="loading" title="Загружаем метрики" description="Собираем показатели ML-сервиса." />
          </div>
        )}

        {data && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <MetricsCard title="Short term" metrics={data.short_term} accent="bg-dry-sage-600" />
            <MetricsCard title="Long term" metrics={data.long_term} accent="bg-dusty-mauve-900" />
          </div>
        )}
        {!loading && !error && !data && (
          <div className="mt-6">
            <StateCard
              variant="empty"
              title="Нет данных по метрикам"
              description="ML-сервис может быть недоступен или еще не собрал статистику."
              actionLabel="Повторить"
              onAction={() => setReloadToken((token) => token + 1)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MetricsCard({ title, metrics, accent }: { title: string; metrics: ModelMetrics; accent: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dusty-mauve-900">{title}</h2>
        <span className={`h-2 w-10 rounded-full ${accent}`} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-dusty-mauve-700">
        <Metric label="MAE" value={metrics.mae} />
        <Metric label="RMSE" value={metrics.rmse} />
        <Metric label="Train size" value={metrics.train_size} />
        <Metric label="Test size" value={metrics.test_size} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  const formatted = typeof value === 'number' ? value.toFixed(value > 50 ? 0 : 2) : String(value)
  return (
    <div className="rounded-2xl border border-dusty-mauve-100 bg-dusty-mauve-50/60 p-4">
      <p className="text-xs uppercase tracking-widest text-dry-sage-500">{label}</p>
      <p className="text-lg font-semibold text-dusty-mauve-900">{formatted}</p>
    </div>
  )
}
