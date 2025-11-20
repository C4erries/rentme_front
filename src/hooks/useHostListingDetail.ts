import { useEffect, useState } from 'react'
import { getHostListing } from '../lib/hostListingApi'
import type { HostListingDetailResponse } from '../types/listing'

interface UseHostListingDetailResult {
  data: HostListingDetailResponse | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useHostListingDetail(listingId: string | null): UseHostListingDetailResult {
  const [data, setData] = useState<HostListingDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!listingId) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    const id = listingId!
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const response = await getHostListing(id)
        setData(response.data)
        setError(null)
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        setData(null)
        setError((err as Error).message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => controller.abort()
  }, [listingId, reloadToken])

  const refresh = () => setReloadToken((token) => token + 1)

  return { data, loading, error, refresh }
}
