import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { ApiError, setAuthToken } from '../lib/api'
import { fetchCurrentUser, loginUser, logoutUser, registerUser } from '../lib/authApi'
import type { UserProfile } from '../types/user'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput extends LoginInput {
  name: string
  wantToHost?: boolean
}

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'rentme.auth_token'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      applyToken(stored)
      setToken(stored)
      void loadProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await fetchCurrentUser()
      setUser(data)
    } catch (error) {
      if ((error as ApiError).status === 401) {
        clearSession()
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const persistToken = useCallback((value: string | null) => {
    setToken(value)
    applyToken(value)
    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [])

  const clearSession = useCallback(() => {
    persistToken(null)
    setUser(null)
  }, [persistToken])

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await loginUser(input)
      persistToken(response.data.token)
      setUser(response.data.user)
    },
    [persistToken],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await registerUser({
        email: input.email,
        password: input.password,
        name: input.name,
        want_to_host: input.wantToHost,
      })
      persistToken(response.data.token)
      setUser(response.data.user)
    },
    [persistToken],
  )

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      return
    }
    const { data } = await fetchCurrentUser()
    setUser(data)
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

  function applyToken(value: string | null) {
    setAuthToken(value)
  }
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
