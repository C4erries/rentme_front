import { useEffect, useState } from 'react'
import { getHostBookings } from '../lib/hostBookingApi'
import type { HostBookingCollection } from '../types/booking'

interface HostBookingsResult {
  data: HostBookingCollection | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useHostBookings(status = 'pending'): HostBookingsResult {
  const [data, setData] = useState<HostBookingCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const response = await getHostBookings(status)
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
  }, [refreshToken, status])

  const refresh = () => setRefreshToken((token) => token + 1)

  return { data, loading, error, refresh }
}
