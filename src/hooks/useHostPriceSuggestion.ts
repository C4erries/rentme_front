import { useCallback, useEffect, useRef, useState } from 'react'
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
  const abortRef = useRef<AbortController | null>(null)
  const requestCounterRef = useRef(0)

  const fetchSuggestion = useCallback(
    async (params: PriceSuggestionParams = {}) => {
      if (!listingId) {
        setError(null)
        return
      }
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const requestId = ++requestCounterRef.current
      try {
        setLoading(true)
        const response = await requestPriceSuggestion(listingId, params, { signal: controller.signal })
        if (controller.signal.aborted || requestId !== requestCounterRef.current) {
          return
        }
        setData(response.data)
        setError(null)
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestCounterRef.current) {
          return
        }
        setError((err as Error).message)
        setData(null)
      } finally {
        if (requestId === requestCounterRef.current) {
          setLoading(false)
        }
      }
    },
    [listingId],
  )

  useEffect(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
    setData(null)
    setError(null)
  }, [listingId])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return { data, loading, error, fetchSuggestion }
}
