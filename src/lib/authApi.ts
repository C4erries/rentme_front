import { apiGet, apiPost } from './api'
import type { AuthResponse, UserProfile } from '../types/user'

interface RegisterPayload {
  email: string
  name: string
  password: string
  want_to_host?: boolean
}

interface LoginPayload {
  email: string
  password: string
}

export async function registerUser(payload: RegisterPayload) {
  return apiPost<AuthResponse>('/auth/register', payload)
}

export async function loginUser(payload: LoginPayload) {
  return apiPost<AuthResponse>('/auth/login', payload)
}

export async function logoutUser() {
  return apiPost<never>('/auth/logout', undefined)
}

export async function fetchCurrentUser() {
  return apiGet<UserProfile>('/auth/me')
}
