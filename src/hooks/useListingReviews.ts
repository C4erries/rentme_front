import { useEffect, useState } from 'react'
import { hasApiBaseUrl } from '../lib/api'
import { getListingReviews } from '../lib/reviewsApi'
import type { ReviewCollection } from '../types/review'

export function useListingReviews(listingId: string | null, limit = 3) {
  const [data, setData] = useState<ReviewCollection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!listingId) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    const targetId = listingId
    if (!hasApiBaseUrl()) {
      setData(null)
      setLoading(false)
      setError('API база не настроена (VITE_API_BASE_URL)')
      return
    }

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const response = await getListingReviews(targetId, { limit })
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
    load()
    return () => {
      cancelled = true
    }
  }, [listingId, limit, refreshToken])

  const refresh = () => setRefreshToken((token) => token + 1)

  return { data, loading, error, refresh }
}
