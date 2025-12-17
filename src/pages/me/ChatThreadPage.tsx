import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Header } from '../../components/Header'
import { useChatMessages } from '../../hooks/useChatMessages'
import { markChatRead, sendChatMessage } from '../../lib/chatApi'
import { withViewTransition } from '../../lib/viewTransitions'
import { useAuth } from '../../context/AuthContext'
import type { ChatMessage } from '../../types/chat'

interface ChatThreadPageProps {
  conversationId: string
  onNavigate: (path: string, options?: { replace?: boolean }) => void
  refreshChats: () => void
}

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: 'short',
})

export function ChatThreadPage({ conversationId, onNavigate, refreshChats }: ChatThreadPageProps) {
  const { user } = useAuth()
  const { data, loading, error, refresh, latestMessageId } = useChatMessages(conversationId, { intervalMs: 8000 })
  const [text, setText] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const lastMarkedRef = useRef<string>('')

  const messages = useMemo<ChatMessage[]>(() => {
    const items = data?.items ?? []
    return [...items].reverse()
  }, [data])

  useEffect(() => {
    if (!latestMessageId || latestMessageId === lastMarkedRef.current) {
      return
    }
    async function mark() {
      try {
        await markChatRead(conversationId, latestMessageId)
        lastMarkedRef.current = latestMessageId
        refreshChats()
      } catch (err) {
        // best-effort; keep console for debugging
        console.warn('mark read failed', err)
      }
    }
    void mark()
  }, [conversationId, latestMessageId, refreshChats])

  const handleSend = async (event: FormEvent) => {
    event.preventDefault()
    const payload = text.trim()
    if (!payload) {
      return
    }
    setSending(true)
    setSendError(null)
    try {
      await sendChatMessage(conversationId, payload)
      setText('')
      refresh()
      refreshChats()
    } catch (err) {
      setSendError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-dusty-mauve-50">
      <Header onNavigate={onNavigate} />
      <div className="container py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-dry-sage-400">Диалог</p>
            <h1 className="text-3xl font-semibold text-dusty-mauve-900">Чат #{conversationId.slice(0, 8)}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => withViewTransition(() => onNavigate('/me/chats'))}
              className="rounded-full border border-dusty-mauve-200 px-4 py-2 text-sm font-semibold text-dusty-mauve-900 transition hover:border-dry-sage-400"
            >
              Назад к списку
            </button>
            <button
              type="button"
              onClick={() => withViewTransition(refresh)}
              className="rounded-full bg-dusty-mauve-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800"
            >
              Обновить
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-6 rounded-3xl border border-white/60 bg-white/80 p-4 text-sm text-dusty-mauve-600 shadow-soft">
            Загружаем сообщения...
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-soft">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-soft">
            {messages.length === 0 && !loading ? (
              <p className="text-sm text-dusty-mauve-500">Сообщений пока нет. Напишите первым.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const isMine = user?.id === message.sender_id
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-2xl rounded-2xl px-4 py-3 shadow-soft ${
                          isMine ? 'bg-dusty-mauve-900 text-white' : 'bg-dry-sage-50 text-dusty-mauve-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-dusty-mauve-300">
                          <span>{isMine ? 'Вы' : message.sender_id}</span>
                          <span>{formatTime(message.created_at)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/90 p-4 shadow-soft">
            <label className="text-sm font-semibold text-dusty-mauve-900">Новое сообщение</label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
              placeholder="Напишите коротко и по делу..."
              className="w-full rounded-2xl border border-dusty-mauve-200 px-3 py-2 text-sm text-dusty-mauve-900 outline-none transition focus:border-dry-sage-500"
            />
            {sendError && <p className="text-xs text-red-600">{sendError}</p>}
            <div className="flex flex-wrap justify-between gap-3">
              <p className="text-xs text-dusty-mauve-500">
                Отправляя сообщение, вы соглашаетесь с правилами общения в Rentme.
              </p>
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-dusty-mauve-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-dusty-mauve-800 disabled:opacity-60"
              >
                {sending ? 'Отправляем...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function formatTime(timestamp: string) {
  try {
    return timeFormatter.format(new Date(timestamp))
  } catch {
    return '—'
  }
}
