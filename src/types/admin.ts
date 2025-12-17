import type { UserProfile } from './user'

export interface UserList {
  items: UserProfile[]
  total: number
}

export interface ModelMetrics {
  mae: number
  rmse: number
  train_size: number
  test_size: number
}

export interface MlMetrics {
  short_term: ModelMetrics
  long_term: ModelMetrics
}
