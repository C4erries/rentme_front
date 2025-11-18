import { useEffect, useState } from 'react'
import { apiGet, hasApiBaseUrl } from '../lib/api'
import type { ListingOverview } from '../types/listing'

export function useListingOverview(listingId: string | null) {
  const [data, setData] = useState<ListingOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!listingId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    if (!hasApiBaseUrl()) {
      setData(null)
      setLoading(false)
      setError('API не настроен. Подключите VITE_API_BASE_URL, чтобы видеть подробности жилья.')
      return
    }

    const controller = new AbortController()

    async function loadOverview() {
      try {
        setLoading(true)
        setError(null)
        const windowFrom = new Date()
        const windowTo = addDays(windowFrom, 45)
        const params = new URLSearchParams({
          from: formatAsISO(windowFrom),
          to: formatAsISO(windowTo),
        })
        const path = `/listings/${listingId}/overview?${params.toString()}`
        const { data } = await apiGet<ListingOverview>(path, {
          signal: controller.signal,
        })
        setData(data)
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        console.warn('Failed to load listing overview', err)
        setData(null)
        setError('Не удалось загрузить подробности. Попробуйте снова позже.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadOverview()
    return () => controller.abort()
  }, [listingId])

  return { data, loading, error }
}

function addDays(base: Date, days: number) {
  const copy = new Date(base)
  copy.setDate(copy.getDate() + days)
  return copy
}

function formatAsISO(date: Date) {
  return date.toISOString().slice(0, 10)
}
