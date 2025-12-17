import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMyChats } from '../lib/chatApi'
import type { ConversationList } from '../types/chat'

interface UseChatListOptions {
  enabled?: boolean
  intervalMs?: number
}

export function useChatList(options: UseChatListOptions = {}) {
  const { enabled = true, intervalMs = 8000 } = options
  const [data, setData] = useState<ConversationList | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(enabled))
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), [])

  useEffect(() => {
    let cancelled = false
    if (!enabled) {
      setLoading(false)
      setData(null)
      setError(null)
      return
    }
    async function load() {
      try {
        setLoading(true)
        const response = await getMyChats()
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
  }, [enabled, refreshToken])

  useEffect(() => {
    if (!enabled || !intervalMs) {
      return
    }
    const id = window.setInterval(() => {
      refresh()
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs, refresh])

  const hasUnread = useMemo(() => data?.items?.some((conv) => conv.has_unread) ?? false, [data])

  return { data, loading, error, refresh, hasUnread }
}
