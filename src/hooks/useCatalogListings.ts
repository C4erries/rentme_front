import { useEffect, useMemo, useState } from 'react'
import { apiGet, hasApiBaseUrl } from '../lib/api'
import type { ListingCatalogResponse } from '../types/listing'

interface UseCatalogListingsResult {
  data: ListingCatalogResponse | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useCatalogListings(search: string): UseCatalogListingsResult {
  const hasBaseUrl = hasApiBaseUrl()
  const [data, setData] = useState<ListingCatalogResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(hasBaseUrl)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const normalizedQuery = useMemo(() => {
    const raw = search?.startsWith('?') ? search.slice(1) : search ?? ''
    const params = new URLSearchParams(raw)
    if (!params.has('limit')) {
      params.set('limit', '20')
    }
    if (!params.has('sort')) {
      params.set('sort', 'price_asc')
    }
    if (!params.has('page')) {
      params.set('page', '1')
    }
    return params.toString()
  }, [search])

  useEffect(() => {
    if (!hasBaseUrl) {
      setData(null)
      setLoading(false)
      setError('API не настроен. Укажите VITE_API_BASE_URL.')
      return
    }

    const controller = new AbortController()
    async function loadCatalog() {
      try {
        setLoading(true)
        setError(null)
        const path = normalizedQuery ? `/listings?${normalizedQuery}` : '/listings'
        const { data } = await apiGet<ListingCatalogResponse>(path, { signal: controller.signal })
        setData(data)
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        console.warn('Catalog load failed', err)
        setData(null)
        setError('Не удалось загрузить каталог. Попробуйте обновить страницу позже.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCatalog()
    return () => controller.abort()
  }, [normalizedQuery, reloadToken, hasBaseUrl])

  const refresh = () => setReloadToken((token) => token + 1)

  return { data, loading, error, refresh }
}
