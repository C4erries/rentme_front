import type { ReactNode } from 'react'

type StateVariant = 'loading' | 'empty' | 'error'

interface StateCardProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  variant?: StateVariant
  children?: ReactNode
}

const variantStyles: Record<StateVariant, { wrapper: string; title: string; text: string }> = {
  loading: {
    wrapper: 'border-dusty-mauve-100 bg-white/80',
    title: 'text-dusty-mauve-900',
    text: 'text-dusty-mauve-600',
  },
  empty: {
    wrapper: 'border-dusty-mauve-100 bg-white/80',
    title: 'text-dusty-mauve-900',
    text: 'text-dusty-mauve-500',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50',
    title: 'text-red-700',
    text: 'text-red-600',
  },
}

export function StateCard({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
  children,
}: StateCardProps) {
  const styles = variantStyles[variant]
  return (
    <div className={`rounded-3xl border p-6 shadow-soft ${styles.wrapper}`}>
      <div className="flex flex-wrap items-center gap-3">
        {variant === 'loading' && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-dusty-mauve-300 border-t-dusty-mauve-700"
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
          {description && <p className={`mt-1 text-sm ${styles.text}`}>{description}</p>}
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-xs font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
