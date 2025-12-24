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
  let response: Response
  try {
    response = await fetch(url, { ...init, headers })
  } catch {
    throw new ApiError('Сервис временно недоступен. Попробуйте позже.', 0)
  }
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
  const fallback = statusFallbackMessage(status)
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const errorValue = Reflect.get(payload, 'error')
    if (typeof errorValue === 'string' && errorValue.trim().length > 0) {
      if (status >= 500 || status === 401 || status === 403) {
        return fallback
      }
      return errorValue
    }
  }
  return fallback
}

function statusFallbackMessage(status: number): string {
  if (status === 0) {
    return 'Сервис временно недоступен. Попробуйте позже.'
  }
  if (status === 400) {
    return 'Проверьте данные и попробуйте снова.'
  }
  if (status === 401) {
    return 'Нужна авторизация, чтобы продолжить.'
  }
  if (status === 403) {
    return 'Недостаточно прав для этого действия.'
  }
  if (status === 404) {
    return 'Ничего не найдено.'
  }
  if (status === 409) {
    return 'Конфликт данных. Обновите страницу и повторите.'
  }
  if (status === 422) {
    return 'Проверьте поля формы и попробуйте снова.'
  }
  if (status >= 500) {
    return 'Сервис временно недоступен. Попробуйте позже.'
  }
  return `Ошибка запроса (${status}).`
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
