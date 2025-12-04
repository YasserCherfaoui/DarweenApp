import { Store } from '@tanstack/store'
import type { User } from '@/types/api'
import { clearSelectedPortal } from './portal-store'
import { clearSelectedCompany } from './company-store'

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

/**
 * Clears all localStorage data related to authentication, portals, and companies
 * This ensures a clean state when switching users
 */
const clearAllAuthData = () => {
  // Clear auth data
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  
  // Clear portal data
  localStorage.removeItem('selected_portal_type')
  localStorage.removeItem('selected_portal_id')
  localStorage.removeItem('selected_portal')
  
  // Clear company data
  localStorage.removeItem('selected_company_id')
  localStorage.removeItem('selected_company')
  localStorage.removeItem('user_role')
}

export const setAuthUser = (user: User, token: string) => {
  // Clear all existing localStorage data before setting new auth data
  // This prevents stale data from previous sessions
  clearAllAuthData()
  
  // Set new auth data
  localStorage.setItem('auth_token', token)
  localStorage.setItem('user', JSON.stringify(user))
  
  // Clear portal and company stores to ensure fresh state
  clearSelectedPortal()
  clearSelectedCompany()
  
  authStore.setState(() => ({
    user,
    token,
    isAuthenticated: true,
  }))
}

export const clearAuthUser = () => {
  // Clear all localStorage data
  clearAllAuthData()
  
  // Clear portal and company stores
  clearSelectedPortal()
  clearSelectedCompany()
  
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



