export interface UserProfile {
  id: string
  email: string
  name: string
  roles: string[]
  blocked?: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: UserProfile
  token: string
}
