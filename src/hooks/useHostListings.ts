import { useEffect, useState } from 'react'
import { listHostListings } from '../lib/hostListingApi'
import type { HostListingCatalogResponse } from '../types/listing'

interface UseHostListingsResult {
  data: HostListingCatalogResponse | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useHostListings(status?: string): UseHostListingsResult {
  const [data, setData] = useState<HostListingCatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const response = await listHostListings({ status, limit: 20 })
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
  }, [status, reloadToken])

  const refresh = () => setReloadToken((token) => token + 1)

  return { data, loading, error, refresh }
}
