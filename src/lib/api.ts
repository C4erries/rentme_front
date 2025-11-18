const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const NORMALIZED_BASE_URL = RAW_BASE_URL.replace(/\/$/, '')

export const apiBaseUrl = NORMALIZED_BASE_URL

export function hasApiBaseUrl(): boolean {
  return apiBaseUrl.length > 0
}

export function buildApiUrl(path: string): string {
  if (!hasApiBaseUrl()) {
    throw new Error('API base URL is not configured')
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${cleanPath}`
}

interface ApiGetOptions extends RequestInit {
  signal?: AbortSignal
}

export async function apiGet<T>(path: string, options: ApiGetOptions = {}) {
  const url = buildApiUrl(path)
  const headers = new Headers(options.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const message = `Request failed with status ${response.status}`
    throw new Error(message)
  }
  const data = (await response.json()) as T
  return { data, response }
}
