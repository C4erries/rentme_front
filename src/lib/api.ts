const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const NORMALIZED_BASE_URL = RAW_BASE_URL.replace(/\/$/, '')

export const apiBaseUrl = NORMALIZED_BASE_URL

let authToken: string | null = null

export class ApiError extends Error {
  status: number
  payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

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

export function setAuthToken(token: string | null) {
  authToken = token?.trim() || null
}

export function getAuthToken(): string | null {
  return authToken
}

export interface ApiRequestOptions extends RequestInit {
  signal?: AbortSignal
}

async function executeRequest<T>(path: string, init: RequestInit) {
  const url = buildApiUrl(path)
  const shouldSendJSON = init.body != null && !(init.body instanceof FormData)
  const headers = buildHeaders(init.headers, shouldSendJSON)
  const response = await fetch(url, { ...init, headers })
  if (!response.ok) {
    const payload = await tryParseJson(response)
    const message = extractErrorMessage(payload, response.status)
    throw new ApiError(message, response.status, payload)
  }
  const data = (await tryParseJson(response)) as T
  return { data, response }
}

function buildHeaders(existing?: HeadersInit, setJSONContentType?: boolean): Headers {
  const headers = new Headers(existing)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (setJSONContentType && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }
  return headers
}

async function tryParseJson(response: Response) {
  if (response.status === 204) {
    return undefined
  }
  const text = await response.text()
  if (!text) {
    return undefined
  }
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const errorValue = Reflect.get(payload, 'error')
    if (typeof errorValue === 'string' && errorValue.trim().length > 0) {
      return errorValue
    }
  }
  return `Request failed with status ${status}`
}

export async function apiGet<T>(path: string, options: ApiRequestOptions = {}) {
  return executeRequest<T>(path, { method: 'GET', ...options })
}

export async function apiPost<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
  const payload = body === undefined ? undefined : JSON.stringify(body)
  return executeRequest<T>(path, {
    method: 'POST',
    body: payload,
    ...options,
  })
}

export async function apiPut<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
  const payload = body === undefined ? undefined : JSON.stringify(body)
  return executeRequest<T>(path, {
    method: 'PUT',
    body: payload,
    ...options,
  })
}

export async function apiPostForm<T>(path: string, form: FormData, options: ApiRequestOptions = {}) {
  return executeRequest<T>(path, {
    method: 'POST',
    body: form,
    ...options,
  })
}
