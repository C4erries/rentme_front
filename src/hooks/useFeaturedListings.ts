import { useEffect, useMemo, useState } from 'react'
import { mockListings } from '../data/mockListings'
import type { Listing } from '../types/listing'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

export function useFeaturedListings() {
  const [listings, setListings] = useState<Listing[]>(mockListings)
  const [loading, setLoading] = useState<boolean>(Boolean(API_BASE_URL))
  const [sourceHint, setSourceHint] = useState<string | null>(null)

  const endpoint = useMemo(() => {
    if (!API_BASE_URL) {
      return null
    }
    return `${API_BASE_URL.replace(/\/$/, '')}/listings/featured`
  }, [])

  useEffect(() => {
    if (!endpoint) {
      setSourceHint('Подборка обновляется офлайн дважды в день')
      return
    }

    const controller = new AbortController()

    async function loadFeatured(url: string) {
      try {
        setLoading(true)
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const payload = (await response.json()) as Listing[]
        setListings(payload)

        const serverTimestamp = response.headers.get('last-modified')
        if (serverTimestamp) {
          const formatted = new Date(serverTimestamp).toLocaleString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'long',
          })
          setSourceHint(`Обновлено ${formatted}`)
        } else {
          setSourceHint('Обновлено несколько минут назад')
        }
      } catch (error) {
        console.warn('Не удалось получить подборку', error)
        setSourceHint('Показаны сохранённые квартиры клуба')
        setListings(mockListings)
      } finally {
        setLoading(false)
      }
    }

    loadFeatured(endpoint)
    return () => controller.abort()
  }, [endpoint])

  return { listings, loading, sourceHint }
}
