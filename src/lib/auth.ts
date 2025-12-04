import { clearAuthUser, setAuthUser } from '@/stores/auth-store'
import type { LoginRequest, RegisterRequest } from '@/types/api'
import { apiClient } from './api-client'

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
    // Don't set auth user - registration now requires email verification
    return response.data
  }
  throw new Error(response.error?.message || 'Registration failed')
}

export const verifyEmail = async (code: string, email: string) => {
  const response = await apiClient.auth.verifyEmail({ code, email })
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error?.message || 'Email verification failed')
}

export const resendVerificationEmail = async (email: string) => {
  const response = await apiClient.auth.resendVerificationEmail({ email })
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error?.message || 'Failed to resend verification email')
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



