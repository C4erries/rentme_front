import { useEffect, useState } from 'react'
import { getMyBookings } from '../lib/meApi'
import type { GuestBookingCollection } from '../types/booking'

interface GuestBookingsResult {
  data: GuestBookingCollection | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useGuestBookings(): GuestBookingsResult {
  const [data, setData] = useState<GuestBookingCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const response = await getMyBookings()
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
  }, [refreshToken])

  const refresh = () => setRefreshToken((token) => token + 1)

  return { data, loading, error, refresh }
}
