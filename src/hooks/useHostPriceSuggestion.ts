import { useCallback, useEffect, useState } from 'react'
import { requestPriceSuggestion } from '../lib/hostListingApi'
import type { HostListingPriceSuggestionResponse } from '../types/listing'

interface PriceSuggestionParams {
  check_in?: string
  check_out?: string
  guests?: number
}

interface UseHostPriceSuggestionResult {
  data: HostListingPriceSuggestionResponse | null
  loading: boolean
  error: string | null
  fetchSuggestion: (params?: PriceSuggestionParams) => Promise<void>
}

export function useHostPriceSuggestion(listingId: string | null): UseHostPriceSuggestionResult {
  const [data, setData] = useState<HostListingPriceSuggestionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestion = useCallback(
    async (params: PriceSuggestionParams = {}) => {
      if (!listingId) {
        setError(null)
        return
      }
      try {
        setLoading(true)
        const response = await requestPriceSuggestion(listingId, params)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [listingId],
  )

  useEffect(() => {
    setData(null)
    setError(null)
  }, [listingId])

  return { data, loading, error, fetchSuggestion }
}
