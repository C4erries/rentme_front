import { useCallback, useEffect, useMemo, useState } from 'react'
import { getChatMessages } from '../lib/chatApi'
import type { ChatMessageList } from '../types/chat'

interface UseChatMessagesOptions {
  enabled?: boolean
  intervalMs?: number
  limit?: number
}

export function useChatMessages(conversationId: string, options: UseChatMessagesOptions = {}) {
  const { enabled = true, intervalMs = 7000, limit = 50 } = options
  const [data, setData] = useState<ChatMessageList | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(enabled))
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), [])

  useEffect(() => {
    let cancelled = false
    if (!enabled || !conversationId) {
      setLoading(false)
      return
    }
    async function load() {
      try {
        setLoading(true)
        const response = await getChatMessages(conversationId, { limit })
        if (!cancelled) {
          setData(response.data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message)
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [conversationId, enabled, limit, refreshToken])

  useEffect(() => {
    if (!enabled || !intervalMs) {
      return
    }
    const id = window.setInterval(() => {
      refresh()
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs, refresh])

  const latestMessageId = useMemo(() => data?.items?.[0]?.id ?? '', [data])

  return { data, loading, error, refresh, latestMessageId }
}
