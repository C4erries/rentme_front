import { useEffect, useMemo, useState } from 'react'
import { mockListings } from '../data/mockListings'
import type { Listing } from '../types/listing'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export function useFeaturedListings() {
  const [listings, setListings] = useState<Listing[]>(mockListings)
  const [loading, setLoading] = useState<boolean>(!!API_BASE_URL)
  const [error, setError] = useState<string | null>(null)

  const endpoint = useMemo(() => {
    if (!API_BASE_URL) {
      return null
    }

    return `${API_BASE_URL.replace(/\/$/, '')}/listings/featured`
  }, [])

  useEffect(() => {
    const targetEndpoint = endpoint

    if (!targetEndpoint) {
      setLoading(false)
      setError('Используются демо-объекты — добавьте VITE_API_BASE_URL для живых данных.')
      return
    }

    const controller = new AbortController()

    async function loadFeatured(url: string) {
      try {
        setLoading(true)
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }
        const payload = (await response.json()) as Listing[]
        setListings(payload)
        setError(null)
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') {
          return
        }

        setListings(mockListings)
        setError('Не удалось получить подборку. Показаны сохранённые объекты.')
      } finally {
        setLoading(false)
      }
    }

    loadFeatured(targetEndpoint)

    return () => controller.abort()
  }, [endpoint])

  return { listings, loading, error, endpoint }
}
