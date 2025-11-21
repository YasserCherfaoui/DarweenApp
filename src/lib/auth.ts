import { apiClient } from './api-client'
import { setAuthUser, clearAuthUser } from '@/stores/auth-store'
import type { LoginRequest, RegisterRequest } from '@/types/api'

export const login = async (data: LoginRequest) => {
  const response = await apiClient.auth.login(data)
  if (response.success && response.data) {
    setAuthUser(response.data.user, response.data.token)
    return response.data
  }
  throw new Error(response.error?.message || 'Login failed')
}

export const register = async (data: RegisterRequest) => {
  const response = await apiClient.auth.register(data)
  if (response.success && response.data) {
    setAuthUser(response.data.user, response.data.token)
    return response.data
  }
  throw new Error(response.error?.message || 'Registration failed')
}

export const logout = () => {
  clearAuthUser()
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const isAuthenticated = (): boolean => {
  const token = getToken()
  return !!token
}



