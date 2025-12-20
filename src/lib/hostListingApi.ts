import { apiGet, apiPost, apiPostForm, apiPut } from './api'
import type {
  HostListingCatalogResponse,
  HostListingDetailResponse,
  HostListingPayload,
  HostListingPriceSuggestionResponse,
  HostListingPhotoUploadResponse,
} from '../types/listing'
import type { ApiRequestOptions } from './api'

interface ListHostListingsParams {
  status?: string
  limit?: number
  offset?: number
}

export async function listHostListings(params: ListHostListingsParams = {}) {
  const search = new URLSearchParams()
  if (params.status) {
    search.set('status', params.status)
  }
  if (params.limit) {
    search.set('limit', String(params.limit))
  }
  if (params.offset) {
    search.set('offset', String(params.offset))
  }
  const path = search.toString() ? `/host/listings?${search.toString()}` : '/host/listings'
  return apiGet<HostListingCatalogResponse>(path)
}

export async function getHostListing(listingId: string) {
  return apiGet<HostListingDetailResponse>(`/host/listings/${listingId}`)
}

export async function createHostListing(payload: HostListingPayload) {
  return apiPost<HostListingDetailResponse>('/host/listings', payload)
}

export async function updateHostListing(listingId: string, payload: HostListingPayload) {
  return apiPut<HostListingDetailResponse>(`/host/listings/${listingId}`, payload)
}

export async function publishHostListing(listingId: string) {
  return apiPost<HostListingDetailResponse>(`/host/listings/${listingId}/publish`, undefined)
}

export async function unpublishHostListing(listingId: string) {
  return apiPost<HostListingDetailResponse>(`/host/listings/${listingId}/unpublish`, undefined)
}

interface PriceSuggestionOptions {
  check_in?: string
  check_out?: string
  guests?: number
}

export async function requestPriceSuggestion(
  listingId: string,
  options: PriceSuggestionOptions = {},
  requestOptions: ApiRequestOptions = {},
) {
  return apiPost<HostListingPriceSuggestionResponse>(`/host/listings/${listingId}/price-suggestion`, { ...options }, requestOptions)
}

export async function uploadListingPhoto(listingId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiPostForm<HostListingPhotoUploadResponse>(`/host/listings/${listingId}/photos`, form)
}
