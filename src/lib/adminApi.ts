import { apiGet, apiPost } from './api'
import type { ApiRequestOptions } from './api'
import type { MlMetrics, UserList } from '../types/admin'
import type { UserProfile } from '../types/user'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }
    const trimmed = typeof value === 'string' ? value.trim() : String(value)
    if (trimmed.length > 0) {
      search.set(key, trimmed)
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getAdminUsers(params: { query?: string; limit?: number; offset?: number } = {}, options: ApiRequestOptions = {}) {
  const query = buildQuery({
    query: params.query,
    limit: params.limit,
    offset: params.offset,
  })
  return apiGet<UserList>(`/admin/users${query}`, options)
}

export function getMlMetrics(options: ApiRequestOptions = {}) {
  return apiGet<MlMetrics>('/admin/ml/metrics', options)
}

export function blockAdminUser(userId: string, options: ApiRequestOptions = {}) {
  return apiPost<UserProfile>(`/admin/users/${userId}/block`, {}, options)
}

export function unblockAdminUser(userId: string, options: ApiRequestOptions = {}) {
  return apiPost<UserProfile>(`/admin/users/${userId}/unblock`, {}, options)
}
