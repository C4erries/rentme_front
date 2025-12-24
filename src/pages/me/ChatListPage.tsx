import { Header } from '../../components/Header'
import { StateCard } from '../../components/StateCard'
import { withViewTransition } from '../../lib/viewTransitions'
import type { ConversationList } from '../../types/chat'

interface ChatListPageProps {
  onNavigate: (path: string, options?: { replace?: boolean }) => void
  chatState: {
    data: ConversationList | null
    loading: boolean
    error: string | null
    refresh: () => void
    hasUnread: boolean
  }
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function ChatListPage({ onNavigate, chatState }: ChatListPageProps) {
  const conversations = chatState.data?.items ?? []

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Мессенджер</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Мои чаты</h1>
            {chatState.hasUnread && (
              <p className="mt-1 text-sm text-red-600">Есть непрочитанные сообщения — загляните в диалоги</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => withViewTransition(chatState.refresh)}
              className="rounded-full border border-dusty-mauve-200 px-5 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
            >
              Обновить список
            </button>
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/catalog'))}
              className="rounded-full bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-dusty-mauve-50 transition hover:bg-dusty-mauve-800"
            >
              Найти жильё
            </button>
          </div>
        </div>

        {chatState.error && !chatState.loading && (
          <div className="mt-6">
            <StateCard
              variant="error"
              title="Не удалось загрузить чаты"
              description={chatState.error}
              actionLabel="Повторить"
              onAction={() => withViewTransition(chatState.refresh)}
            />
          </div>
        )}
        {chatState.loading && (
          <div className="mt-6">
            <StateCard variant="loading" title="Загружаем чаты" description="Проверяем новые сообщения." />
          </div>
        )}

        {!chatState.loading && conversations.length === 0 && (
          <div className="mt-10">
            <StateCard
              variant="empty"
              title="Пока нет переписок"
              description="Напишите арендодателю из каталога, чтобы начать общение."
              actionLabel="Перейти в каталог"
              onAction={() => withViewTransition(() => onNavigate('/catalog'))}
            />
          </div>
        )}

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {conversations.map((conversation) => (
            <article
              key={conversation.id}
              className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-dry-sage-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <p className="text-xs uppercase tracking-widest text-dry-sage-500">
                    {conversation.listing_id ? `Объявление ${conversation.listing_id}` : 'Диалог без объявления'}
                  </p>
                  <h2 className="text-xl font-semibold text-dusty-mauve-900">Чат #{conversation.id.slice(0, 8)}</h2>
                  <p className="text-sm text-dusty-mauve-500">
                    {conversation.participants.length} участника · {formatActivity(conversation)}
                  </p>
                </div>
                {conversation.has_unread && <span className="h-3 w-3 rounded-full bg-red-500" />}
              </div>
              <div className="flex items-center justify-between text-sm text-dusty-mauve-600">
                <span className="rounded-full bg-dry-sage-50 px-3 py-1 text-dry-sage-700">
                  Последнее сообщение: {formatPreview(conversation)}
                </span>
                <button
                  type="button"
                  onClick={() => withViewTransition(() => onNavigate(`/me/chats/${conversation.id}`))}
                  className="rounded-full border border-dusty-mauve-200 px-4 py-2 font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400 hover:text-dry-sage-700"
                >
                  Открыть
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatActivity(conversation: ConversationList['items'][number]) {
  const timestamp = conversation.last_message_at || conversation.created_at
  try {
    return dateFormatter.format(new Date(timestamp))
  } catch {
    return 'н/д'
  }
}

function formatPreview(conversation: ConversationList['items'][number]) {
  const text = (conversation.last_message_text || '').trim().replace(/\s+/g, ' ')
  if (!text) {
    return 'Сообщений ещё нет'
  }
  if (text.length > 120) {
    return `${text.slice(0, 120)}...`
  }
  return text
}
