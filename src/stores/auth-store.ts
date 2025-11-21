import { Store } from '@tanstack/store'
import type { User } from '@/types/api'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const getInitialState = (): AuthState => {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  }
}

export const authStore = new Store<AuthState>(getInitialState())

export const setAuthUser = (user: User, token: string) => {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('user', JSON.stringify(user))
  authStore.setState(() => ({
    user,
    token,
    isAuthenticated: true,
  }))
}

export const clearAuthUser = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  authStore.setState(() => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }))
}

export const updateAuthUser = (updates: Partial<User>) => {
  const currentState = authStore.state
  if (!currentState.user) return

  const updatedUser = { ...currentState.user, ...updates }
  localStorage.setItem('user', JSON.stringify(updatedUser))
  authStore.setState((state) => ({
    ...state,
    user: updatedUser,
  }))
}



